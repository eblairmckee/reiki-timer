import { afterEach, expect, test } from "vitest";
import type { LibraryCard, TarotService } from "@/features/tarot-flash/model/types";
import { createTarotService } from "@/features/tarot-flash/services/library-storage";

const services: TarotService[] = [];
const databases: string[] = [];
function serviceFor(name = `tarot-test-${crypto.randomUUID()}`) {
  const service = createTarotService(name);
  services.push(service);
  if (!databases.includes(name)) {
    databases.push(name);
  }
  return { name, service };
}
function idbRequest<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function changeDatabase(name: string, write: (tx: IDBTransaction) => void) {
  const database = await idbRequest(indexedDB.open(name, 1));
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction(["cards", "libraries", "meta"], "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
      write(tx);
    });
  } finally {
    database.close();
  }
}
afterEach(async () => {
  for (const service of services) {
    service.close();
  }
  await Promise.all(databases.map((name) => idbRequest(indexedDB.deleteDatabase(name))));
  services.length = 0;
  databases.length = 0;
});

test("concurrent first use creates one library and exactly 78 cards", async () => {
  const first = serviceFor();
  const second = serviceFor(first.name);
  const [a, b] = await Promise.all([
    first.service.initializeLibrary(),
    second.service.initializeLibrary(),
  ]);
  expect(a.id).toBe(b.id);
  const cards = await first.service.listCards();
  expect(cards).toHaveLength(78);
  expect(new Set(cards.map((card) => card.id)).size).toBe(78);
  expect(cards.every((card) => card.content.meanings.upright.keywords.length === 0)).toBe(true);
});

test("adding Planet preserves older cards, identities, and revisions", async () => {
  const { name, service } = serviceFor();
  const library = await service.initializeLibrary();
  const cards: LibraryCard[] = (await service.listCards()).map((stored) => ({
    ...stored,
    content: {
      ...stored.content,
      correspondences: { element: [], zodiac: [] },
    },
  }));
  cards[0].content.meanings.upright.keywords = ["personal meaning"];
  await changeDatabase(name, (tx) => {
    tx.objectStore("libraries").put({
      ...library,
      correspondenceDefinitions: library.correspondenceDefinitions.filter(
        ({ id }) => id !== "planet"
      ),
    });
    for (const stored of cards) {
      tx.objectStore("cards").put(stored);
    }
  });
  const reopened = serviceFor(name).service;
  const extended = await reopened.initializeLibrary();
  expect(extended.correspondenceDefinitions).toContainEqual({ id: "planet", label: "Planet" });
  expect(await reopened.getLibrary()).toEqual(extended);
  expect(await reopened.listCards()).toEqual(cards);
  expect(await reopened.initializeLibrary()).toEqual(extended);
  const [card] = cards;
  card.content.correspondences.planet = ["Moon"];
  expect((await reopened.saveCard(card.id, card.content, card.revision)).kind).toBe("saved");
  expect((await reopened.getCard(card.catalogCardId))?.content.correspondences.planet).toEqual([
    "Moon",
  ]);
});

test("concurrent writes accept one revision and preserve edits across reopened initialization", async () => {
  const first = serviceFor();
  await first.service.initializeLibrary();
  const second = serviceFor(first.name);
  await second.service.initializeLibrary();
  const card = await first.service.getCard("swords-02");
  if (!card) {
    throw new Error("Missing fixture");
  }
  const a = structuredClone(card.content);
  a.meanings.upright.keywords = ["peace"];
  const b = structuredClone(card.content);
  b.meanings.upright.keywords = ["balance"];
  b.meanings.reversed = { keywords: [], notes: "Only notes" };
  const results = await Promise.all([
    first.service.saveCard(card.id, a, card.revision),
    second.service.saveCard(card.id, b, card.revision),
  ]);
  expect(results.map((result) => result.kind).sort()).toEqual(["conflict", "saved"]);
  const winner = results.find((result) => result.kind === "saved");
  if (winner === undefined) {
    throw new Error("Missing saved result");
  }
  first.service.close();
  second.service.close();
  const reopened = serviceFor(first.name).service;
  await reopened.initializeLibrary();
  expect(await reopened.getCard("swords-02")).toEqual(winner.card);
});

test("invalid drafts do not write; notes-only reversals are valid with an upright keyword", async () => {
  const { service } = serviceFor();
  await service.initializeLibrary();
  const card = await service.getCard("major-00");
  if (!card) {
    throw new Error("Missing fixture");
  }
  const content = structuredClone(card.content);
  content.meanings.reversed = { keywords: [], notes: "Caution" };
  expect((await service.saveCard(card.id, content, card.revision)).kind).toBe("validation");
  expect(await service.getCard("major-00")).toEqual(card);
  content.meanings.upright.keywords = [" beginning "];
  expect((await service.saveCard(card.id, content, card.revision)).kind).toBe("saved");
  expect((await service.getCard("major-00"))?.content.meanings).toEqual({
    reversed: { keywords: [], notes: "Caution" },
    upright: { keywords: ["beginning"], notes: "" },
  });
});

test("damaged and missing records never trigger reseeding", async () => {
  const { name, service } = serviceFor();
  await service.initializeLibrary();
  const card = await service.getCard("major-00");
  if (!card) {
    throw new Error("Missing fixture");
  }
  await changeDatabase(name, (tx) => {
    tx.objectStore("cards").delete(card.id);
  });
  expect(await service.getCard("major-00")).toBeNull();
  await expect(serviceFor(name).service.initializeLibrary()).rejects.toMatchObject({
    code: "missing",
  });
  expect(await service.listCards()).toHaveLength(77);
  await changeDatabase(name, (tx) => {
    tx.objectStore("meta").delete("active");
  });
  await expect(serviceFor(name).service.initializeLibrary()).rejects.toMatchObject({
    code: "damaged",
  });
  expect(await service.listCards()).toHaveLength(77);
});

test("unsupported library versions leave stored interpretations intact", async () => {
  const { name, service } = serviceFor();
  const library = await service.initializeLibrary();
  const cards = await service.listCards();
  await changeDatabase(name, (tx) => {
    tx.objectStore("libraries").put({ ...library, schemaVersion: 99 });
  });
  await expect(serviceFor(name).service.initializeLibrary()).rejects.toMatchObject({
    code: "unsupported",
  });
  expect(await service.listCards()).toEqual(cards);
});

test("schema 1 migration keeps personal content and removes editable titles and imagery", async () => {
  const { name, service } = serviceFor();
  const library = await service.initializeLibrary();
  const cards = await service.listCards();
  await changeDatabase(name, (tx) => {
    tx.objectStore("libraries").put({ ...library, schemaVersion: 1 });
    for (const [index, card] of cards.entries()) {
      const { otherNames: _otherNames, ...content } = card.content;
      tx.objectStore("cards").put({
        ...card,
        content: {
          ...content,
          imagery: "Old imagery notes",
          meanings: {
            reversed: { keywords: [], notes: "my reversed notes" },
            upright: { keywords: ["my keyword"], notes: "my notes" },
          },
          names: index === 0 ? ["The Fool", "The Traveler"] : [],
        },
      });
    }
  });
  const reopened = serviceFor(name).service;
  expect((await reopened.initializeLibrary()).schemaVersion).toBe(2);
  const migrated = await reopened.listCards();
  expect(migrated.map((card) => card.id)).toEqual(cards.map((card) => card.id));
  expect(migrated[0].content.otherNames).toEqual(["The Traveler"]);
  expect(migrated[0].content.meanings).toEqual({
    reversed: { keywords: [], notes: "my reversed notes" },
    upright: { keywords: ["my keyword"], notes: "my notes" },
  });
  expect(migrated.every((card) => !("imagery" in card.content || "names" in card.content))).toBe(
    true
  );
  expect(migrated[0].revision).not.toBe(cards[0].revision);
  expect((await reopened.saveCard(cards[0].id, migrated[0].content, cards[0].revision)).kind).toBe(
    "conflict"
  );
  await reopened.initializeLibrary();
  expect(await reopened.listCards()).toEqual(migrated);
});
