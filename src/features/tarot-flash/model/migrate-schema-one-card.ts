import { catalog } from "../data/catalog";
import { isObject } from "./validation";

/** Convert legacy editable names to aliases and retire imagery notes. The result still requires card validation. */
export function migrateSchemaOneCard(value: unknown) {
  if (!(isObject(value) && isObject(value.content))) {
    return null;
  }
  const catalogCard = catalog.find((card) => card.id === value.catalogCardId);
  const { names, imagery: _imagery, ...content } = value.content;
  if (!(catalogCard && Array.isArray(names) && names.every((name) => typeof name === "string"))) {
    return null;
  }
  const defaultName = catalogCard.defaultName.toLowerCase();
  return {
    ...value,
    content: {
      ...content,
      otherNames: names.filter((name) => name.trim().toLowerCase() !== defaultName),
    },
  };
}
