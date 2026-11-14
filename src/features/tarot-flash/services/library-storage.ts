import { catalog } from "../data/catalog";
import { correspondenceFields } from "../data/correspondences";
import { createSeed, schemaVersion } from "../data/seed";
import { addDefaultCorrespondences } from "../model/migrate-default-correspondences";
import { addDefaultOtherNames } from "../model/migrate-default-other-names";
import { migrateSchemaOneCard } from "../model/migrate-schema-one-card";
import { replaceDefaultMeanings } from "../model/replace-default-meanings";
import type {
  CardContent,
  LibraryCard,
  SaveResult,
  StudyLibrary,
  TarotService,
} from "../model/types";
import {
  isContent,
  isLibrary,
  isLibraryCard,
  isObject,
  normalizeContent,
  validateDraft,
} from "../model/validation";

export const databaseName = "tarot-flash";
type StorageCode = "unavailable" | "blocked" | "damaged" | "unsupported" | "missing";
export class LibraryStorageError extends Error {
  readonly code: StorageCode;
  constructor(code: StorageCode, message: string) {
    super(message);
    this.name = "LibraryStorageError";
    this.code = code;
  }
}
export function storageMessage(error: unknown) {
  return error instanceof LibraryStorageError
    ? error.message
    : "Couldn’t access your saved cards. Check browser storage and try again. Your content has not been reset.";
}
function request<T>(operation: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    operation.onsuccess = () => resolve(operation.result);
    operation.onerror = () => reject(operation.error);
  });
}
async function transaction<T>(
  database: IDBDatabase,
  mode: IDBTransactionMode,
  run: (tx: IDBTransaction) => Promise<T>
): Promise<T> {
  const tx = database.transaction(["meta", "libraries", "cards"], mode);
  const completed = new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error("Storage transaction canceled"));
    tx.onerror = () => reject(tx.error);
  });
  // Register rejection handling immediately; a failed request can abort before run settles.
  const settled = completed.then(
    () => ({ ok: true as const }),
    (error: unknown) => ({ error, ok: false as const })
  );
  try {
    const result = await run(tx);
    const outcome = await settled;
    if (!outcome.ok) {
      throw outcome.error;
    }
    return result;
  } catch (error) {
    try {
      tx.abort();
    } catch {
      /* Already completed or aborted. */
    }
    await settled;
    throw error;
  }
}

async function seedFirstUse(tx: IDBTransaction) {
  const meta = tx.objectStore("meta");
  const libraries = tx.objectStore("libraries");
  const cards = tx.objectStore("cards");
  const libraryCount = await request(libraries.count());
  const cardCount = await request(cards.count());
  const metaCount = await request(meta.count());
  if (libraryCount || cardCount || metaCount) {
    throw new LibraryStorageError(
      "damaged",
      "Library identity is missing, but stored data exists. It has not been replaced."
    );
  }
  const seed = createSeed(crypto.randomUUID(), crypto.randomUUID(), new Date().toISOString());
  meta.add({ key: "active", libraryId: seed.library.id });
  libraries.add(seed.library);
  for (const card of seed.cards) {
    cards.add(card);
  }
  return seed.library;
}

function readLibrary(value: unknown): StudyLibrary {
  if (
    isObject(value) &&
    typeof value.schemaVersion === "number" &&
    value.schemaVersion !== schemaVersion
  ) {
    throw new LibraryStorageError(
      "unsupported",
      "This library uses an unsupported version. Open it with a compatible app version; your content has not been changed."
    );
  }
  if (!isLibrary(value)) {
    throw new LibraryStorageError(
      "damaged",
      "The saved library is incomplete or damaged. Your stored content has been left untouched."
    );
  }
  return value;
}
function readCard(value: unknown, libraryId: string): LibraryCard {
  if (isLibraryCard(value, libraryId)) {
    return value;
  }
  throw new LibraryStorageError(
    "damaged",
    "A saved card is damaged. Your stored content has been left untouched."
  );
}

function migrateDefaults(card: LibraryCard, previousVersion: number, updatedAt: string) {
  const correspondences = previousVersion < 3 ? addDefaultCorrespondences(card) : card;
  const aliases = previousVersion < 4 ? addDefaultOtherNames(correspondences) : correspondences;
  return { ...replaceDefaultMeanings(aliases), revision: crypto.randomUUID(), updatedAt };
}

async function prepareLibrary(tx: IDBTransaction, libraryId: string) {
  const libraries = tx.objectStore("libraries");
  const cards = tx.objectStore("cards");
  const stored: unknown = await request(libraries.get(libraryId));
  const previousVersion = isObject(stored) ? stored.schemaVersion : undefined;
  const migrating =
    previousVersion === 1 ||
    previousVersion === 2 ||
    previousVersion === 3 ||
    previousVersion === 4;
  const existing = readLibrary(
    migrating && isObject(stored) ? { ...stored, schemaVersion } : stored
  );
  if (existing.id !== libraryId) {
    throw new LibraryStorageError("damaged", "The saved library identity does not match.");
  }
  const records: unknown[] = await request(cards.index("library").getAll(existing.id));
  const parsed = records.map((card) =>
    readCard(previousVersion === 1 ? migrateSchemaOneCard(card) : card, existing.id)
  );
  if (
    parsed.length !== catalog.length ||
    new Set(parsed.map((card) => card.catalogCardId)).size !== catalog.length
  ) {
    throw new LibraryStorageError(
      "missing",
      "Some cards are missing from the saved library. Existing interpretations have not been replaced."
    );
  }
  const missingDefinitions = correspondenceFields.filter(
    (field) => !existing.correspondenceDefinitions.some((entry) => entry.id === field.id)
  );
  if (migrating || missingDefinitions.length) {
    const extended = {
      ...existing,
      correspondenceDefinitions: [
        ...existing.correspondenceDefinitions,
        ...missingDefinitions.map(({ id, label }) => ({ id, label })),
      ],
      updatedAt: new Date().toISOString(),
    };
    libraries.put(extended);
    if (migrating) {
      for (const card of parsed) {
        cards.put(migrateDefaults(card, previousVersion, extended.updatedAt));
      }
    }
    return extended;
  }
  return existing;
}

/** Database version 1 owns store/index structure; library.schemaVersion owns content.
 * Content migrations run atomically in prepareLibrary without replaying seed data. */
export function createTarotService(
  name = databaseName,
  factory: IDBFactory | undefined = globalThis.indexedDB
): TarotService {
  let opening: Promise<IDBDatabase> | undefined;
  let activeLibrary: string | undefined;
  let closed = false;
  function open() {
    if (closed) {
      return Promise.reject(
        new LibraryStorageError(
          "unavailable",
          "This library connection has closed. Reopen the page to try again."
        )
      );
    }
    if (opening) {
      return opening;
    }
    opening = new Promise<IDBDatabase>((resolve, reject) => {
      if (!factory) {
        reject(
          new LibraryStorageError(
            "unavailable",
            "This browser does not provide IndexedDB. Allow browser storage to use your study library."
          )
        );
        return;
      }
      const operation = factory.open(name, 1);
      let blocked = false;
      operation.onupgradeneeded = (event) => {
        if (event.oldVersion !== 0) {
          return;
        }
        const db = operation.result;
        db.createObjectStore("meta", { keyPath: "key" });
        db.createObjectStore("libraries", { keyPath: "id" });
        const cards = db.createObjectStore("cards", { keyPath: "id" });
        cards.createIndex("library", "libraryId");
        cards.createIndex("identity", ["libraryId", "catalogCardId"], { unique: true });
      };
      operation.onblocked = () => {
        blocked = true;
        reject(
          new LibraryStorageError(
            "blocked",
            "Another tab is blocking the library upgrade. Close other Tarot Flash tabs, then try again."
          )
        );
      };
      operation.onerror = () =>
        reject(
          operation.error?.name === "VersionError"
            ? new LibraryStorageError(
                "unsupported",
                "This library was saved by a newer app. Use the newer version; your content has not been changed."
              )
            : operation.error
        );
      operation.onsuccess = () => {
        const db = operation.result;
        if (closed || blocked) {
          db.close();
          reject(
            new LibraryStorageError("unavailable", "The library connection closed. Try again.")
          );
          return;
        }
        db.onversionchange = () => {
          db.close();
          opening = undefined;
        };
        resolve(db);
      };
    }).catch((error: unknown) => {
      opening = undefined;
      throw error;
    });
    return opening;
  }
  function libraryId() {
    if (!activeLibrary) {
      throw new LibraryStorageError("unavailable", "Open your library before reading cards.");
    }
    return activeLibrary;
  }
  return {
    close() {
      closed = true;
      opening?.then(
        (db) => db.close(),
        () => undefined
      );
    },
    async getCard(catalogCardId) {
      const id = libraryId();
      return transaction(await open(), "readonly", async (tx) => {
        const value: unknown = await request(
          tx.objectStore("cards").index("identity").get([id, catalogCardId])
        );
        return value === undefined ? null : readCard(value, id);
      });
    },
    async getLibrary() {
      const id = libraryId();
      return transaction(await open(), "readonly", async (tx) =>
        readLibrary(await request(tx.objectStore("libraries").get(id)))
      );
    },
    async initializeLibrary() {
      const db = await open();
      const library = await transaction(db, "readwrite", async (tx) => {
        const meta = tx.objectStore("meta");
        const active: unknown = await request(meta.get("active"));
        if (active === undefined) {
          return seedFirstUse(tx);
        }
        if (!isObject(active) || typeof active.libraryId !== "string") {
          throw new LibraryStorageError(
            "damaged",
            "The library identity is damaged. Stored content has not been changed."
          );
        }
        return prepareLibrary(tx, active.libraryId);
      });
      activeLibrary = library.id;
      return library;
    },
    async listCards() {
      const id = libraryId();
      return transaction(await open(), "readonly", async (tx) => {
        const values: unknown[] = await request(
          tx.objectStore("cards").index("library").getAll(id)
        );
        return values.map((value) => readCard(value, id));
      });
    },
    async saveCard(cardId, content: CardContent, expectedRevision): Promise<SaveResult> {
      try {
        const id = libraryId();
        if (!isContent(content)) {
          return {
            kind: "storage",
            message: "This draft has invalid data. Your saved card has not been changed.",
          };
        }
        const normalized = normalizeContent(content);
        const errors = validateDraft(normalized);
        if (errors.length) {
          return { errors, kind: "validation" };
        }
        return await transaction(await open(), "readwrite", async (tx): Promise<SaveResult> => {
          const store = tx.objectStore("cards");
          const value: unknown = await request(store.get(cardId));
          if (value === undefined) {
            return { kind: "missing" };
          }
          const current = readCard(value, id);
          if (current.revision !== expectedRevision) {
            return { current, kind: "conflict" };
          }
          const library = readLibrary(await request(tx.objectStore("libraries").get(id)));
          const updatedAt = new Date().toISOString();
          const saved = {
            ...current,
            content: normalized,
            revision: crypto.randomUUID(),
            updatedAt,
          };
          store.put(saved);
          tx.objectStore("libraries").put({ ...library, updatedAt });
          return { card: saved, kind: "saved" };
        });
      } catch (error) {
        return { kind: "storage", message: storageMessage(error) };
      }
    },
  };
}
