import { mkdtemp, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync, write } from "bun";
import { analyzeTokens, type SourceFile, themePath } from "./token-analysis";

interface Fixture {
  errors: number;
  files: SourceFile[];
  name: string;
  warnings?: string[];
}
const css = (text: string): SourceFile[] => [{ path: "src/probe.css", text }];
const script = (text: string): SourceFile[] => [{ path: "src/probe.tsx", text }];
const svg = (text: string): SourceFile[] => [{ path: "src/probe.svg", text }];
const fixtures: Fixture[] = [
  {
    errors: 1,
    files: script('export const broken = "unfinished'),
    name: "TS syntax failure is closed",
  },
  {
    errors: 1,
    files: css(
      "@media (forced-colors: active) or (prefers-contrast: more) {.x {color: CanvasText;}}"
    ),
    name: "CSS mixed media OR",
  },
  { errors: 1, files: css(".x { color: var(--ink);"), name: "CSS syntax failure is closed" },
  { errors: 1, files: svg('<svg><path fill="red"></svg>'), name: "XML syntax failure is closed" },
  {
    errors: 0,
    files: script(
      'test("white on glass in a field", () => {}); export const text = "a red alert";'
    ),
    name: "TS prose with color words",
  },
  {
    errors: 0,
    // biome-ignore lint/suspicious/noTemplateCurlyInString: The fixture contains source text for dynamic channel serialization.
    files: script('export const shader = `rgb(${channels.join(" ")})`;'),
    name: "TS fully dynamic channel serialization",
  },
  { errors: 1, files: css(".x { color: rebeccapurple; }"), name: "CSS named paint" },
  {
    errors: 2,
    files: css(".x { background: linear-gradient(rgb(1 2 3), royalblue); }"),
    name: "CSS gradient operands",
  },
  { errors: 1, files: css(".x { box-shadow: 0 2px 4px hsl(40 20% 20%); }"), name: "CSS shadow" },
  { errors: 1, files: css(".x { color: var(--missing, red); }"), name: "CSS fallback" },
  { errors: 1, files: css(".x { --paint: oklch(50% 0.2 50); }"), name: "CSS custom property" },
  {
    errors: 1,
    files: css(".x { color: color-mix(in srgb, var(--ink), pink); }"),
    name: "CSS token mix literal",
  },
  {
    errors: 0,
    files: css(".x { color: color-mix(in srgb, var(--ink), transparent); }"),
    name: "CSS token mix valid",
  },
  {
    errors: 0,
    files: css('/* red rgb(1 2 3) */ .x { content: "red #fff"; fill: url(#fff); }'),
    name: "CSS comments strings fragment",
  },
  {
    errors: 0,
    files: css(".x { animation-name: red; font-family: black; }"),
    name: "CSS nonpaint named identifier",
  },
  {
    errors: 0,
    files: css(".x { color: currentColor; border-color: transparent; }"),
    name: "CSS currentColor transparent",
  },
  { errors: 1, files: css(".x { color: CanvasText; }"), name: "CSS system paint outside scope" },
  {
    errors: 0,
    files: css("@media (forced-colors: active) {.x { color: CanvasText; }}"),
    name: "CSS forced colors active",
  },
  {
    errors: 1,
    files: css("@media (forced-colors: none) {.x { color: CanvasText; }}"),
    name: "CSS forced colors inactive",
  },
  {
    errors: 1,
    files: css(
      "@media (forced-colors: active), (prefers-contrast: more) {.x {color: CanvasText;}}"
    ),
    name: "CSS mixed media alternative",
  },
  {
    errors: 3,
    files: script('export const shader = ["#aabbcc", "navy", "rgb(1 2 3)"];'),
    name: "TS shader colors",
  },
  {
    errors: 1,
    files: script('export const shade = "linear-gradient(var(--ink), red)";'),
    name: "TS shader gradient",
  },
  {
    errors: 1,
    files: script('export const shade = "var(--ink, hwb(30 10% 10%))";'),
    name: "TS shader fallback",
  },
  {
    errors: 1,
    // biome-ignore lint/suspicious/noTemplateCurlyInString: The fixture must contain a template expression as source text.
    files: script("export const shade = `linear-gradient(${ink}, yellow)`;"),
    name: "TS template shader",
  },
  {
    errors: 2,
    files: script('export const icon = <svg><path fill="red" stroke="#abc" /></svg>;'),
    name: "TS JSX paint",
  },
  {
    errors: 2,
    files: script(
      'export const icon = <span style={{color: "red", boxShadow: "0 0 1px blue"}} />;'
    ),
    name: "TS style paint",
  },
  {
    errors: 0,
    files: script(
      'export const icon = <Button variant="black" name="red" id="blue"/>; type Variant = "black" | "gray";'
    ),
    name: "TS semantic variant",
  },
  {
    errors: 0,
    files: script('// const c = "red";\nexport const icon = <use href="#fff"/>;'),
    name: "TS fragment and comment",
  },
  {
    errors: 0,
    files: script(
      'export const icon = <svg fill="currentColor" stroke="transparent" style={{color: "var(--ink)", fill: "color-mix(in srgb, var(--ink), transparent)"}}/>;'
    ),
    name: "TS token paints",
  },
  {
    errors: 1,
    files: script('export const icon = <svg fill="CanvasText"/>;'),
    name: "TS system paint",
  },
  {
    errors: 2,
    files: svg(
      '<svg xmlns="http://www.w3.org/2000/svg"><path fill="rebeccapurple" stroke="#abc"/></svg>'
    ),
    name: "SVG paint attributes",
  },
  {
    errors: 2,
    files: svg(
      '<svg xmlns="http://www.w3.org/2000/svg"><path style="fill: red; stroke: rgb(1 2 3)"/></svg>'
    ),
    name: "SVG style attribute",
  },
  {
    errors: 1,
    files: svg('<svg xmlns="http://www.w3.org/2000/svg"><style>.x {fill: #fff;}</style></svg>'),
    name: "SVG embedded stylesheet",
  },
  {
    errors: 0,
    files: svg(
      '<svg xmlns="http://www.w3.org/2000/svg"><!-- fill="red" --><path fill="url(#fff)" stroke="currentColor"/><use href="#abc"/></svg>'
    ),
    name: "SVG comments fragments",
  },
  {
    errors: 0,
    files: [{ path: themePath, text: ":root { --ink: red; }" }],
    name: "Theme exception",
    warnings: ["--ink"],
  },
  {
    errors: 0,
    files: [
      {
        path: themePath,
        text: ":root {\n--orphan: red;\n--alias: var(--base, var(--fallback));\n--base: blue;\n--fallback: green;\n--test-only: pink;\n--write-only: navy;\n--declaration-only: plum;\n--ref-color-pigment-ruby: maroon;\n--ref-color-pigment-unused: purple;\n--direct-read: gold;\n--js-alias: var(--base);\n--js-dependency: purple;\n--write-dependency: pink;\n}",
      },
      {
        path: "src/production.css",
        text: ".x {color: var(--alias); background: var(--js-alias);}",
      },
      { path: "src/production.test.css", text: ".x { color: var(--test-only); }" },
      {
        path: "src/production.test.ts",
        text: 'getComputedStyle(x).getPropertyValue("--test-only");',
      },
      {
        path: "src/production.ts",
        text: 'export const colors = [["--ref-color-pigment-ruby"]] as const satisfies readonly AtmospherePalette[]; const declared = "--declaration-only"; style.setProperty("--write-only", "var(--write-dependency)"); style.setProperty("--js-alias", "var(--js-dependency)"); style.getPropertyValue("--direct-read"); palette.map(token => style.getPropertyValue(token));',
      },
    ],
    name: "Unused graph distinguishes reads writes tests declarations",
    warnings: [
      "--orphan",
      "--test-only",
      "--write-only",
      "--declaration-only",
      "--ref-color-pigment-unused",
      "--write-dependency",
    ],
  },
  {
    errors: 0,
    files: [
      { path: themePath, text: ":root {--ocean-deep: red; --unused-ocean: blue;}" },
      {
        path: "src/weather.ts",
        text: 'const shoreline = ["--ocean-deep"] as const satisfies AtmospherePalette; palette.map(token => style.getPropertyValue(token));',
      },
    ],
    name: "Unrelated typed material palette uses direct custom-property names",
    warnings: ["--unused-ocean"],
  },
  {
    errors: 0,
    files: [{ path: themePath, text: ":root {--a: var(--b); --b: var(--a);}" }],
    name: "Unused alias cycle",
    warnings: ["--a", "--b"],
  },
  {
    errors: 0,
    files: [
      { path: themePath, text: ":root {--ref-color-pigment-ruby: red;}" },
      {
        path: "src/read.ts",
        text: 'export const colors = [["--ref-color-pigment-ruby"]] satisfies readonly AtmospherePalette[]; const name = arbitraryInput; style.getPropertyValue(name);',
      },
    ],
    name: "Unrelated dynamic read does not bless palette",
    warnings: ["--ref-color-pigment-ruby"],
  },
];

const results = fixtures.map((fixture) => {
  const diagnostics = analyzeTokens(fixture.files);
  const errors = diagnostics.filter((item) => item.severity === "error");
  const warnings = diagnostics.filter((item) => item.severity === "warning");
  const warningNames = warnings.map((item) => item.message.split(" ")[0]).sort();
  const passed =
    errors.length === fixture.errors &&
    JSON.stringify(warningNames) === JSON.stringify([...(fixture.warnings ?? [])].sort());
  return {
    diagnostics,
    exitStatus: errors.length ? 1 : 0,
    expectedErrors: fixture.errors,
    name: fixture.name,
    passed,
  };
});

// Exercise the ordinary configured lint command, not just --only capability.
// Keep probes under the repository so Biome applies its ordinary VCS and path policy.
// mkdtemp gives this run sole ownership of the directory removed in finally.
const fixtureDirectory = await mkdtemp(resolve("scripts/.token-fixtures-"));
const biomeResults: { name: string; exitStatus: number; passed: boolean; output: string }[] = [];
try {
  for (const [name, text, expected] of [
    ["CSS hex rejected by ordinary lint", ".x {color: #abcdef;}\n", 1],
    ["CSS token accepted by ordinary lint", ".x {color: var(--ink);}\n", 0],
  ] as const) {
    const path = join(fixtureDirectory, "probe.css");
    // biome-ignore lint/performance/noAwaitInLoops: The same fixture path must be rewritten before each sequential lint process.
    await write(path, text);
    const result = spawnSync(
      ["bun", "run", "--bun", "biome", "lint", "--config-path", resolve("."), path],
      {
        stderr: "pipe",
        stdout: "pipe",
      }
    );
    const output =
      new TextDecoder().decode(result.stdout) + new TextDecoder().decode(result.stderr);
    biomeResults.push({
      exitStatus: result.exitCode,
      name,
      output,
      passed:
        result.exitCode === expected && (expected === 0 || output.includes("style/noHexColors")),
    });
  }
} finally {
  await rm(fixtureDirectory, { force: true, recursive: true });
}
for (const result of [...results, ...biomeResults]) {
  console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name} (exit ${result.exitStatus})`);
  if (!result.passed) {
    console.error("output" in result ? result.output : result.diagnostics);
  }
}
console.log(
  `${results.filter((result) => result.passed).length}/${results.length} token analysis fixtures passed.`
);
console.log(
  `${biomeResults.filter((result) => result.passed).length}/${biomeResults.length} ordinary lint fixtures passed.`
);
if ([...results, ...biomeResults].some((result) => !result.passed)) {
  process.exitCode = 1;
}
