import { resolve } from "node:path";
import { file as bunFile, Glob, spawnSync } from "bun";
import { analyzeTokens } from "./token-analysis";

const files = await Array.fromAsync(new Glob("src/**/*.{css,ts,tsx,svg}").scan("."));
const diagnostics = analyzeTokens(
  await Promise.all(files.map(async (path) => ({ path, text: await bunFile(path).text() })))
);
for (const diagnostic of diagnostics) {
  console.error(
    `${resolve(diagnostic.path)}:${diagnostic.line}:${diagnostic.column} ${diagnostic.severity} ${diagnostic.rule}: ${diagnostic.message}`
  );
}
// This is the same configured built-in rule used by ordinary project lint.
// Other lint concerns remain the responsibility of the project's lint command.
const biome = spawnSync(
  ["bun", "run", "--bun", "biome", "lint", "--only=style/noHexColors", "src"],
  { stderr: "pipe", stdout: "pipe" }
);
if (biome.exitCode !== 0) {
  console.error(new TextDecoder().decode(biome.stdout));
  console.error(new TextDecoder().decode(biome.stderr));
}
if (diagnostics.some((diagnostic) => diagnostic.severity === "error") || biome.exitCode !== 0) {
  process.exitCode = 1;
} else {
  console.log(`Theme color ownership: passed (${diagnostics.length} unused-token warnings).`);
}
