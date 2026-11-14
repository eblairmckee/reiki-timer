import { expect, test } from "vitest";
import { createSeed } from "../data/seed";
import { migrateSchemaOneCard } from "./migrate-schema-one-card";

const [original] = createSeed("library", "owner", "2026-11-14T00:00:00Z").cards;
const { otherNames: _otherNames, ...content } = original.content;
const legacy = {
  ...original,
  content: {
    ...content,
    imagery: "Old notes",
    names: [" The Fool ", " My first card ", "THE FOOL", "The Unknown"],
  },
};

test("schema 1 converts editable names to aliases while preserving card data and metadata", () => {
  expect(migrateSchemaOneCard(legacy)).toEqual({
    ...original,
    content: { ...content, otherNames: [" My first card ", "The Unknown"] },
  });
  expect(legacy.content.names).toEqual([
    " The Fool ",
    " My first card ",
    "THE FOOL",
    "The Unknown",
  ]);
});

test("schema 1 rejects records with missing names, malformed names or an unknown card", () => {
  expect(migrateSchemaOneCard(original)).toBeNull();
  expect(migrateSchemaOneCard(null)).toBeNull();
  expect(migrateSchemaOneCard({ ...legacy, catalogCardId: "missing" })).toBeNull();
  expect(
    migrateSchemaOneCard({ ...legacy, content: { ...legacy.content, names: [42] } })
  ).toBeNull();
});
