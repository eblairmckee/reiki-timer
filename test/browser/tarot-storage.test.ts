import { afterEach, expect, test } from "vitest";
import { catalog } from "@/features/tarot-flash/data/catalog";
import { defaultMeanings } from "@/features/tarot-flash/data/default-keywords";
import { emptyContent, schemaVersion } from "@/features/tarot-flash/data/seed";
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
// IndexedDB returns primary-key order, not the fixed RWS catalog order used by these fixtures.
async function cardsInCatalogOrder(service: TarotService) {
  const cards = await service.listCards();
  return cards.sort(
    (a, b) =>
      catalog.findIndex((entry) => entry.id === a.catalogCardId) -
      catalog.findIndex((entry) => entry.id === b.catalogCardId)
  );
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
  const cards = await cardsInCatalogOrder(first.service);
  expect(cards).toHaveLength(78);
  expect(new Set(cards.map((card) => card.id)).size).toBe(78);
  expect(cards.every((card) => card.content.meanings.upright.keywords.length > 0)).toBe(true);
  expect(cards.every((card) => (card.content.meanings.reversed?.keywords.length ?? 0) > 0)).toBe(
    true
  );
});

test("adding Planet preserves older cards, identities, and revisions", async () => {
  const { name, service } = serviceFor();
  const library = await service.initializeLibrary();
  const cards: LibraryCard[] = (await cardsInCatalogOrder(service)).map((stored) => ({
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
  expect(await cardsInCatalogOrder(reopened)).toEqual(cards);
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
  content.meanings.upright.keywords = [];
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
  expect(await cardsInCatalogOrder(service)).toHaveLength(77);
  await changeDatabase(name, (tx) => {
    tx.objectStore("meta").delete("active");
  });
  await expect(serviceFor(name).service.initializeLibrary()).rejects.toMatchObject({
    code: "damaged",
  });
  expect(await cardsInCatalogOrder(service)).toHaveLength(77);
});

test("unsupported library versions leave stored interpretations intact", async () => {
  const { name, service } = serviceFor();
  const library = await service.initializeLibrary();
  const cards = await cardsInCatalogOrder(service);
  await changeDatabase(name, (tx) => {
    tx.objectStore("libraries").put({ ...library, schemaVersion: 99 });
  });
  await expect(serviceFor(name).service.initializeLibrary()).rejects.toMatchObject({
    code: "unsupported",
  });
  expect(await cardsInCatalogOrder(service)).toEqual(cards);
});

test("schema 1 migration preserves aliases, removes editable titles and imagery, and upgrades meanings", async () => {
  const { name, service } = serviceFor();
  const library = await service.initializeLibrary();
  const cards = await cardsInCatalogOrder(service);
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
  expect((await reopened.initializeLibrary()).schemaVersion).toBe(schemaVersion);
  const migrated = await cardsInCatalogOrder(reopened);
  expect(migrated.map((card) => card.id)).toEqual(cards.map((card) => card.id));
  expect(migrated[0].content.otherNames).toEqual(["The Traveler"]);
  expect(migrated[0].content.meanings).toEqual(defaultMeanings(catalog[0]));
  expect(migrated.every((card) => !("imagery" in card.content || "names" in card.content))).toBe(
    true
  );
  expect(migrated[0].revision).not.toBe(cards[0].revision);
  expect((await reopened.saveCard(cards[0].id, migrated[0].content, cards[0].revision)).kind).toBe(
    "conflict"
  );
  await reopened.initializeLibrary();
  expect(await cardsInCatalogOrder(reopened)).toEqual(migrated);
});

test("schema 2 fills blank cards once and preserves personal choices, IDs, and stale-write protection", async () => {
  const { name, service } = serviceFor();
  const library = await service.initializeLibrary();
  const originals = (await cardsInCatalogOrder(service)).map((card) => ({
    ...card,
    content: emptyContent(),
    revision: "seed-1",
  }));
  const [personalized] = originals;
  personalized.content.otherNames = ["My traveler"];
  personalized.content.meanings.upright.keywords = ["my meaning"];
  personalized.content.correspondences.element = ["Water"];
  personalized.revision = "personal-revision";
  await changeDatabase(name, (tx) => {
    tx.objectStore("libraries").put({ ...library, schemaVersion: 2 });
    for (const card of originals) {
      tx.objectStore("cards").put(card);
    }
  });
  const a = serviceFor(name).service;
  const b = serviceFor(name).service;
  const [first, second] = await Promise.all([a.initializeLibrary(), b.initializeLibrary()]);
  expect(first).toEqual(second);
  expect(first.schemaVersion).toBe(schemaVersion);
  const updated = await cardsInCatalogOrder(a);
  expect(updated.map((card) => card.id)).toEqual(originals.map((card) => card.id));
  expect(updated[0].content).toEqual({
    ...personalized.content,
    meanings: defaultMeanings(catalog[0]),
  });
  const magician = await a.getCard("major-01");
  if (!magician) {
    throw new Error("Missing test card");
  }
  expect(magician.content.correspondences).toEqual({
    element: ["Air"],
    planet: ["Mercury"],
    zodiac: [],
  });
  expect(magician.revision).not.toBe("seed-1");
  const cleared = { ...magician.content, correspondences: { element: [], planet: [], zodiac: [] } };
  cleared.meanings.upright.keywords = ["my own system"];
  expect((await a.saveCard(magician.id, cleared, "seed-1")).kind).toBe("conflict");
  const saved = await a.saveCard(magician.id, cleared, magician.revision);
  expect(saved.kind).toBe("saved");
  const reopened = serviceFor(name).service;
  await reopened.initializeLibrary();
  expect((await reopened.getCard("major-01"))?.content.correspondences).toEqual(
    cleared.correspondences
  );
  expect(await reopened.getCard(personalized.catalogCardId)).toEqual(updated[0]);
});

test("schema 1 blank cards receive defaults after their catalog titles become fixed", async () => {
  const { name, service } = serviceFor();
  const library = await service.initializeLibrary();
  const cards = await cardsInCatalogOrder(service);
  await changeDatabase(name, (tx) => {
    tx.objectStore("libraries").put({ ...library, schemaVersion: 1 });
    for (const card of cards) {
      const { otherNames: _otherNames, ...blank } = emptyContent();
      tx.objectStore("cards").put({
        ...card,
        content: {
          ...blank,
          imagery: "",
          names: card.catalogCardId === "major-00" ? ["The Fool"] : [],
        },
      });
    }
  });
  const reopened = serviceFor(name).service;
  await reopened.initializeLibrary();
  const fool = await reopened.getCard("major-00");
  expect(fool?.content.otherNames).toEqual([]);
  expect(fool?.content.correspondences).toEqual({
    element: ["Air"],
    planet: ["Uranus"],
    zodiac: [],
  });
  const migrated = await cardsInCatalogOrder(reopened);
  await reopened.initializeLibrary();
  expect(await cardsInCatalogOrder(reopened)).toEqual(migrated);
});

test("schema 3 appends Thoth names once, preserves cleared correspondences, and rejects stale saves", async () => {
  const { name, service } = serviceFor();
  const library = await service.initializeLibrary();
  const originals = (await cardsInCatalogOrder(service)).map((card) => ({
    ...card,
    content: emptyContent(),
    revision: "old-aliases",
  }));
  const [, magician] = originals;
  magician.content.otherNames = ["My magician"];
  magician.content.meanings.upright.keywords = ["My interpretation"];
  originals[8].content.otherNames = ["lust"];
  await changeDatabase(name, (tx) => {
    tx.objectStore("libraries").put({ ...library, schemaVersion: 3 });
    for (const card of originals) {
      tx.objectStore("cards").put(card);
    }
  });
  const first = serviceFor(name).service;
  const second = serviceFor(name).service;
  const libraries = await Promise.all([first.initializeLibrary(), second.initializeLibrary()]);
  expect(libraries[0]).toEqual(libraries[1]);
  expect(libraries[0].schemaVersion).toBe(schemaVersion);
  const updated = await cardsInCatalogOrder(first);
  expect(updated[0].content).toEqual({
    ...originals[0].content,
    meanings: defaultMeanings(catalog[0]),
  });
  expect(updated[8].content).toEqual({
    ...originals[8].content,
    meanings: defaultMeanings(catalog[8]),
  });
  expect(updated[1].content).toEqual({
    ...magician.content,
    meanings: defaultMeanings(catalog[1]),
    otherNames: ["My magician", "Magus"],
  });
  expect(updated.map((card) => card.id)).toEqual(originals.map((card) => card.id));
  expect(updated[1].revision).not.toBe(magician.revision);
  expect((await first.saveCard(magician.id, updated[1].content, magician.revision)).kind).toBe(
    "conflict"
  );
  const cleared = { ...updated[1].content, otherNames: [] };
  const saved = await first.saveCard(magician.id, cleared, updated[1].revision);
  expect(saved.kind).toBe("saved");
  await second.initializeLibrary();
  expect((await second.getCard("major-01"))?.content).toEqual(cleared);
});

test("schema 4 replaces all test meanings once, preserves shared values, and protects later edits", async () => {
  const { name, service } = serviceFor();
  const library = await service.initializeLibrary();
  const originals = (await cardsInCatalogOrder(service)).map((card) => ({
    ...card,
    content: {
      ...emptyContent(),
      meanings: {
        reversed: { keywords: ["test reversed"], notes: "test reversal notes" },
        upright: { keywords: ["test upright"], notes: "test notes" },
      },
    },
    revision: "before-keywords",
  }));
  originals[0].content.otherNames = ["Personal alias"];
  originals[0].content.correspondences.element = ["Custom element"];
  await changeDatabase(name, (tx) => {
    tx.objectStore("libraries").put({ ...library, schemaVersion: 4 });
    for (const card of originals) {
      tx.objectStore("cards").put(card);
    }
  });
  const first = serviceFor(name).service;
  const second = serviceFor(name).service;
  const [a, b] = await Promise.all([first.initializeLibrary(), second.initializeLibrary()]);
  expect(a).toEqual(b);
  expect(a.schemaVersion).toBe(schemaVersion);
  const updated = await cardsInCatalogOrder(first);
  for (const [index, card] of updated.entries()) {
    expect(card.content).toEqual({
      ...originals[index].content,
      meanings: defaultMeanings(catalog[index]),
    });
    expect(card.id).toBe(originals[index].id);
    expect(card.createdAt).toBe(originals[index].createdAt);
    expect(card.revision).not.toBe(originals[index].revision);
  }
  const [firstCard] = updated;
  expect((await first.saveCard(firstCard.id, firstCard.content, originals[0].revision)).kind).toBe(
    "conflict"
  );
  const personal = {
    ...firstCard.content,
    meanings: { reversed: null, upright: { keywords: ["my new meaning"], notes: "my new notes" } },
  };
  const saved = await first.saveCard(firstCard.id, personal, firstCard.revision);
  expect(saved.kind).toBe("saved");
  await second.initializeLibrary();
  expect((await second.getCard(firstCard.catalogCardId))?.content).toEqual(personal);
});
