import { resolve } from "node:path";

const theme = "src/components/ui/styles/theme.css";
const literalColor =
  /#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\(\s*[\d.#-]/gi;
const namedPaint = /(?:[:,]\s*|\bcolor\s*=\s*["'])(?:black|white)\b/gi;
const violations: string[] = [];

for await (const name of new Bun.Glob("src/**/*.{css,ts,tsx,svg}").scan(".")) {
  if (name === theme || name.endsWith(".gen.ts")) continue;
  const lines = (await Bun.file(name).text()).split("\n");
  lines.forEach((line, index) => {
    literalColor.lastIndex = 0;
    namedPaint.lastIndex = 0;
    if (literalColor.test(line) || namedPaint.test(line))
      violations.push(`${resolve(name)}:${index + 1}: use a theme variable for color`);
  });
}

if (violations.length) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Theme color ownership: passed.");
}
