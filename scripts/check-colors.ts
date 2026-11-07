import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { checkColorSource } from "./color-policy";

const root = process.cwd();
const sourceExtension = /\.(?:css|[cm]?[jt]sx?|svg)$/u;
async function files(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
          return files(path);
        }
        return entry.isFile() && sourceExtension.test(entry.name) ? [path] : [];
      })
    )
  ).flat();
}
const sources = (
  await Promise.all(["src", "public"].map((directory) => files(join(root, directory))))
).flat();
const diagnostics = (
  await Promise.all(
    sources.map(async (path) =>
      checkColorSource(relative(root, path), await readFile(path, "utf8"))
    )
  )
).flat();
for (const diagnostic of diagnostics) {
  console.error(
    `${diagnostic.file}:${diagnostic.line}:${diagnostic.column}: ${diagnostic.message}`
  );
}
console.log(
  `Color ownership: ${sources.length} files, ${diagnostics.length} errors. Static paint contexts and local const aliases only; computed/cross-module paints and numeric renderer arrays require review.`
);
process.exitCode = diagnostics.length ? 1 : 0;
