import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "bun";

interface Probe {
  bad: string;
  good: string;
  id: string;
  note: string;
}

const probes: Probe[] = [
  {
    bad: `import type { ReactNode } from "react";\nexport function Parent() {\n  function Child(): ReactNode { return <span>child</span>; }\n  return <Child />;\n}\n`,
    good: "export function Child() { return <span>child</span>; }\nexport function Parent() { return <Child />; }\n",
    id: "nested-component",
    note: "React component defined inside another component",
  },
  {
    bad: `import { useEffect } from "react";\nexport function Sample({ value }: { value: string }) { useEffect(() => { document.title = value; }, []); return null; }\n`,
    good: `import { useEffect } from "react";\nexport function Sample({ value }: { value: string }) { useEffect(() => { document.title = value; }, [value]); return null; }\n`,
    id: "hook-dependencies",
    note: "effect reads a reactive value absent from its dependencies",
  },
  {
    bad: `import { useState } from "react";\nexport function Sample({ active }: { active: boolean }) { if (active) useState(0); return null; }\n`,
    good: `import { useState } from "react";\nexport function Sample({ active }: { active: boolean }) { const [value] = useState(0); return active ? <span>{value}</span> : null; }\n`,
    id: "hook-top-level",
    note: "hook called conditionally",
  },
  {
    bad: "export function Sample({ items }: { items: string[] }) { return <ul>{items.map((item) => <li>{item}</li>)}</ul>; }\n",
    good: "export function Sample({ items }: { items: { id: string; label: string }[] }) { return <ul>{items.map((item) => <li key={item.id}>{item.label}</li>)}</ul>; }\n",
    id: "jsx-key",
    note: "mapped elements lack stable keys; valid case uses item identity",
  },
  {
    bad: "export function Sample({ items }: { items: string[] }) { return <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>; }\n",
    good: "export function Sample({ items }: { items: { id: string; label: string }[] }) { return <ul>{items.map((item) => <li key={item.id}>{item.label}</li>)}</ul>; }\n",
    id: "array-index-key",
    note: "array index used as a key; nearest valid uses stable identity",
  },
  {
    bad: "export function Sample({ count }: { count: number }) { return <div>{count && <span>items</span>}</div>; }\n",
    good: "export function Sample({ count }: { count: number }) { return <div>{count > 0 && <span>items</span>}</div>; }\n",
    id: "render-zero",
    note: "conditional expression can render numeric zero; valid case is boolean",
  },
  {
    bad: `import { useEffect, useState } from "react";\nexport function Sample({ first }: { first: string }) { const [name, setName] = useState(""); useEffect(() => { setName(first); }, [first]); return <span>{name}</span>; }\n`,
    good: "export function Sample({ first }: { first: string }) { const name = first; return <span>{name}</span>; }\n",
    id: "derived-state-effect",
    note: "derived state is copied in an effect instead of calculated during render",
  },
  {
    bad: "function activate() { return 1; }\nexport function Sample() { return <div onClick={activate}>Activate</div>; }\n",
    good: `function activate() { return 1; }\nexport function Sample() { return <button type="button" onClick={activate}>Activate</button>; }\n`,
    id: "a11y-native-control",
    note: "interactive behavior on a static element; valid case uses native button",
  },
  {
    bad: `export function Sample() { return <button type="button"><svg aria-hidden="true" viewBox="0 0 1 1" /></button>; }\n`,
    good: `export function Sample() { return <button type="button" aria-label="Close"><svg aria-hidden="true" viewBox="0 0 1 1" /></button>; }\n`,
    id: "a11y-name",
    note: "icon-only button without accessible name; valid case has aria-label",
  },
  {
    bad: `export function Sample() { return <div role="button" aria-checked="true" tabIndex={0}>Select</div>; }\n`,
    good: `export function Sample() { return <button type="button" aria-pressed="true">Select</button>; }\n`,
    id: "a11y-aria-role",
    note: "ARIA property unsupported for the role; valid case uses native semantics",
  },
  {
    bad: "export function Sample() { return <><label>Minutes</label><input /></>; }\n",
    good: `export function Sample() { return <><label htmlFor="minutes">Minutes</label><input id="minutes" /></>; }\n`,
    id: "a11y-label",
    note: "label is not associated with a control; valid case uses matching id",
  },
  {
    bad: `export function Sample() { return <button type="button" tabIndex={3}>Activate</button>; }\n`,
    good: `export function Sample() { return <button type="button">Activate</button>; }\n`,
    id: "a11y-positive-tabindex",
    note: "positive tab index; valid case keeps native tab order",
  },
  {
    bad: `export function Sample() { return <button type="button" aria-hidden="true">Activate</button>; }\n`,
    good: `export function Sample() { return <span aria-hidden="true">Decoration</span>; }\n`,
    id: "a11y-hidden-focusable",
    note: "focusable control is hidden from assistive technology; valid case hides static decoration",
  },
  {
    bad: `function activate() { return 1; }\nexport function Sample() { return <div role="button" tabIndex={0} onClick={activate}>Open</div>; }\n`,
    good: `function activate() { return 1; }\nexport function Sample() { return <button type="button" onClick={activate}>Open</button>; }\n`,
    id: "a11y-keyboard",
    note: "click-only static element (keyboard support is not inferred from click handler)",
  },
  {
    bad: `export function Sample() { return <img src="/image.png" width={100} height={100} />; }\n`,
    good: `export function Sample() { return <img src="/image.png" alt="A seated person" width={100} height={100} />; }\n`,
    id: "a11y-alt-text",
    note: "image lacks alternative text; valid case supplies alt text",
  },
  {
    bad: `export function Sample() { return <video controls src="/movie.mp4" />; }\n`,
    good: `export function Sample() { return <video controls src="/movie.mp4"><track kind="captions" src="/captions.vtt" /></video>; }\n`,
    id: "a11y-captions",
    note: "video lacks captions track; valid case supplies a captions track",
  },
  {
    bad: `export function Sample() { return <svg viewBox="0 0 1 1"><circle cx="0.5" cy="0.5" r="0.5" /></svg>; }\n`,
    good: `export function Sample() { return <svg aria-hidden="true" viewBox="0 0 1 1"><circle cx="0.5" cy="0.5" r="0.5" /></svg>; }\n`,
    id: "decorative-svg",
    note: "standalone SVG lacks title/hidden semantics; valid decorative SVG is aria-hidden",
  },
  {
    bad: "export function Sample({ html }: { html: string }) { return <div dangerouslySetInnerHTML={{ __html: html }} />; }\n",
    good: "export function Sample({ text }: { text: string }) { return <div>{text}</div>; }\n",
    id: "dangerous-html",
    note: "raw HTML injection; valid case renders escaped React text",
  },
  {
    bad: ".fixture { color: #123456; }\n",
    good: ".fixture { color: var(--sys-color-ink-on-glass); }\n",
    id: "theme-hex-css",
    note: "literal CSS hex outside the theme; valid near-match uses semantic token",
  },
  {
    bad: `export function Sample() { return <span style={{ color: "#123456" }}>Text</span>; }\n`,
    good: `export function Sample() { return <span style={{ color: "var(--sys-color-ink-on-glass)" }}>Text</span>; }\n`,
    id: "theme-hex-jsx",
    note: "literal inline JSX paint; valid near-match resolves a semantic CSS token",
  },
  {
    bad: `export function Sample() { const Leading_icon = "icon"; return <span>{Leading_icon}</span>; }\n`,
    good: `export function Sample() { const thing = "icon"; return <span>{thing}</span>; }\n`,
    id: "meaningful-name",
    note: "both identifiers are accepted despite the latter carrying no domain meaning",
  },
  {
    bad: `interface Settings { duration: number }\nexport const settings: Settings = { duration: "short" };\n`,
    good: "interface Settings { duration: number }\nexport const settings: Settings = { duration: 10 };\n",
    id: "type-contract",
    note: "wrong value for a typed public contract; Biome lint is syntax-based",
  },

  {
    bad: "export function Sample({ text }: { text: string }) { const pattern = /hello/u; return <span>{String(pattern.test(text))}</span>; }\n",
    good: "const pattern = /hello/u;\nexport function Sample({ text }: { text: string }) { return <span>{String(pattern.test(text))}</span>; }\n",
    id: "regexp-literal-hoist",
    note: "static RegExp literal created during render versus module scope; narrower than dynamic memoization guidance",
  },
  {
    bad: `export function Sample({ text, query }: { text: string; query: string }) { const pattern = new RegExp(query, "u"); return <span>{String(pattern.test(text))}</span>; }\n`,
    good: `import { useMemo } from "react";\nexport function Sample({ text, query }: { text: string; query: string }) { const pattern = useMemo(() => new RegExp(query, "u"), [query]); return <span>{String(pattern.test(text))}</span>; }\n`,
    id: "regexp-dynamic-memo",
    note: "dynamic constructor per render versus memoized constructor; query intentionally represents a regex pattern",
  },
  {
    bad: "interface User { isActive: boolean; name: string }\nexport function names(users: User[]) { return users.map(user => user.isActive ? user.name : null).filter(Boolean); }\n",
    good: "interface User { isActive: boolean; name: string }\nexport function names(users: User[]) { return users.flatMap(user => user.isActive && user.name ? [user.name] : []); }\n",
    id: "flatmap-map-filter",
    note: "section's map/filter(Boolean) versus truthiness-preserving flatMap; not the map/flat rule shape",
  },
  {
    bad: "export function names(groups: string[][]) { return groups.map(group => group.slice(0, 2)).flat(); }\n",
    good: "export function names(groups: string[][]) { return groups.flatMap(group => group.slice(0, 2)); }\n",
    id: "flatmap-map-flat",
    note: "narrower useFlatMap map/flat diagnostic; supporting contrast, not the section's map/filter example",
  },
  {
    bad: `import { useMemo } from "react";\nexport function Sample({ users }: { users: string[] }) { const sorted = useMemo(() => users.sort((a, b) => a.localeCompare(b)), [users]); return <span>{sorted.join(", ")}</span>; }\n`,
    good: `import { useMemo } from "react";\nexport function Sample({ users }: { users: string[] }) { const sorted = useMemo(() => users.toSorted((a, b) => a.localeCompare(b)), [users]); return <span>{sorted.join(", ")}</span>; }\n`,
    id: "immutable-props-sort",
    note: "sort mutates a prop array inside useMemo versus toSorted preserving it",
  },
  {
    bad: "export function label(value: string | undefined) { return value!.trim(); }\n",
    good: `export function label(value: string | undefined) { if (value === undefined) { throw new Error("Missing label"); } return value.trim(); }\n`,
    id: "non-null-assertion",
    note: "non-null assertion versus explicit narrowing at a boundary",
  },
  {
    bad: `type Status = { kind: "idle" } | { kind: "running" };\nexport function label(status: Status): string { switch (status.kind) { case "idle": return "Idle"; default: return "Unknown"; } }\n`,
    good: `type Status = { kind: "idle" } | { kind: "running" };\nexport function label(status: Status): string { switch (status.kind) { case "idle": return "Idle"; case "running": return "Running"; default: { const unexpected: never = status; throw new Error(String(unexpected)); } } }\n`,
    id: "union-exhaustiveness",
    note: "default masks an unhandled discriminated-union member versus explicit cases and never guard; default presence alone is not exhaustiveness",
  },
  {
    bad: `import { useEffect, useEffectEvent } from "react";\nexport function Sample({ onTick }: { onTick: () => void }) { const handleTick = useEffectEvent(onTick); useEffect(() => { const timer = setInterval(handleTick, 1000); return () => clearInterval(timer); }, [handleTick]); return null; }\n`,
    good: `import { useEffect, useEffectEvent } from "react";\nexport function Sample({ onTick }: { onTick: () => void }) { const handleTick = useEffectEvent(onTick); useEffect(() => { const timer = setInterval(handleTick, 1000); return () => clearInterval(timer); }, []); return null; }\n`,
    id: "effect-event-dependency",
    note: "Effect Event included in dependencies versus omitted; section explicitly claims a Hooks lint diagnostic",
  },
  {
    bad: `import { forwardRef } from "react";\nimport type { ComponentPropsWithoutRef } from "react";\nexport const Sample = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(function RenderInput(props, ref) { return <input {...props} ref={ref} />; });\n`,
    good: `import type { ComponentPropsWithRef } from "react";\nexport function Sample(props: ComponentPropsWithRef<"input">) { return <input {...props} />; }\n`,
    id: "react19-ref-prop",
    note: "new React 19 wrapper uses forwardRef versus native typed ref prop; section preserves forwardRef for older/library contracts",
  },
  {
    bad: `export function Sample() { return <img src="/image.png" alt="A seated person" />; }\n`,
    good: `export function Sample() { return <img src="/image.png" alt="A seated person" width={100} height={100} />; }\n`,
    id: "image-intrinsic-size",
    note: "image without width/height versus intrinsic dimensions; section also permits known aspect ratio and covers delivery behavior beyond this rule",
  },
  {
    bad: `export function Sample() { return <script src="/scripts/utils.js" />; }\n`,
    good: `export function Sample() { return <script src="/scripts/utils.js" defer />; }\n`,
    id: "nonblocking-script",
    note: "external script without async/defer versus deferred script; does not verify delivery priority or execution dependency correctness",
  },
];

const root = join(process.cwd(), ".lint-probes");
await mkdir(root, { recursive: true });
const lines: string[] = [
  "# Ordinary lint fixture results",
  "",
  "Generated by `bun run scripts/probe-lint.ts`. Every pair was run separately through `bun run lint <path>` using the repository configuration; no `--only` selection was used.",
  "",
  "| Probe | Bad exit | Bad diagnostic | Valid near-match exit | Valid diagnostic |",
  "| --- | ---: | --- | ---: | --- |",
];

async function run(name: string, source: string) {
  let ext = "tsx";
  if (name === "theme-hex-css-bad" || name === "theme-hex-css-good") {
    ext = "css";
  } else if (name.startsWith("type-contract-")) {
    ext = "ts";
  }
  const path = join(root, `${name}.${ext}`);
  await writeFile(path, source);
  const proc = spawn(["bun", "run", "lint", path], { stderr: "pipe", stdout: "pipe" });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  const output = `${stdout}\n${stderr}`.trim();
  const diagnostics = [
    ...output.matchAll(/lint\/(?<rule>[\w/]+)[^\n]*\n\n\s+× (?<message>[^\n]+)/gu),
  ]
    .map((match) => `${match.groups?.rule}: ${match.groups?.message?.trim()}`)
    .map((line) => line.replaceAll("|", "\\|"));
  return {
    diagnostics:
      diagnostics.join("; ") || (exitCode === 0 ? "none" : output.replaceAll("|", "\\|")),
    exitCode,
    path,
  };
}

const expectedBadRules: Record<string, string> = {
  "a11y-alt-text": "useAltText",
  "a11y-aria-role": "useAriaPropsSupportedByRole",
  "a11y-captions": "useMediaCaption",
  "a11y-hidden-focusable": "noAriaHiddenOnFocusable",
  "a11y-keyboard": "useKeyWithClickEvents",
  "a11y-label": "noLabelWithoutControl",
  "a11y-native-control": "noStaticElementInteractions",
  "a11y-positive-tabindex": "noPositiveTabindex",
  "array-index-key": "noArrayIndexKey",
  "dangerous-html": "noDangerouslySetInnerHtml",
  "decorative-svg": "noSvgWithoutTitle",
  "effect-event-dependency": "useExhaustiveDependencies",
  "flatmap-map-flat": "useFlatMap",
  "hook-dependencies": "useExhaustiveDependencies",
  "hook-top-level": "useHookAtTopLevel",
  "image-intrinsic-size": "useImageSize",
  "jsx-key": "useJsxKeyInIterable",
  "nested-component": "noNestedComponentDefinitions",
  "non-null-assertion": "noNonNullAssertion",
  "nonblocking-script": "noSyncScripts",
  "react19-ref-prop": "noReactForwardRef",
  "regexp-literal-hoist": "useTopLevelRegex",
  "render-zero": "noLeakedRender",
  "theme-hex-css": "noHexColors",
};
const documentedLintGaps = new Set([
  "derived-state-effect",
  "a11y-name",
  "theme-hex-jsx",
  "meaningful-name",
  "type-contract",
  "regexp-dynamic-memo",
  "flatmap-map-filter",
  "immutable-props-sort",
  "union-exhaustiveness",
]);
const failures: string[] = [];

try {
  const pairs = await Promise.all(
    probes.map(async (probe) => ({
      bad: await run(`${probe.id}-bad`, probe.bad),
      good: await run(`${probe.id}-good`, probe.good),
      probe,
    }))
  );
  let typeBad: Awaited<ReturnType<typeof run>> | undefined;
  let typeGood: Awaited<ReturnType<typeof run>> | undefined;
  for (const { bad, good, probe } of pairs) {
    if (probe.id === "type-contract") {
      typeBad = bad;
      typeGood = good;
    }
    if (good.exitCode !== 0) {
      failures.push(`${probe.id} valid fixture exited ${good.exitCode}`);
    }
    const expectedRule = expectedBadRules[probe.id];
    if (expectedRule && (bad.exitCode !== 1 || !bad.diagnostics.includes(expectedRule))) {
      failures.push(
        `${probe.id} expected rejecting diagnostic ${expectedRule}; got ${bad.exitCode} / ${bad.diagnostics}`
      );
    }
    if (documentedLintGaps.has(probe.id) && bad.exitCode !== 0) {
      failures.push(
        `${probe.id} documented gap unexpectedly rejected: ${bad.exitCode} / ${bad.diagnostics}`
      );
    }
    lines.push(
      `| ${probe.id} — ${probe.note} | ${bad.exitCode} | ${bad.diagnostics} | ${good.exitCode} | ${good.diagnostics} |`
    );
  }
  const compilerResults = await Promise.all(
    (
      [
        ["invalid", typeBad],
        ["valid", typeGood],
      ] as const
    ).map(async ([label, result]) => {
      if (!result) {
        return null;
      }
      const proc = spawn(
        [
          "node",
          "./node_modules/typescript/bin/tsc",
          "--ignoreConfig",
          "--noEmit",
          "--strict",
          "--skipLibCheck",
          "--target",
          "ES2022",
          "--module",
          "ESNext",
          "--moduleResolution",
          "Bundler",
          result.path,
        ],
        { stderr: "pipe", stdout: "pipe" }
      );
      const [stdout, stderr, exitCode] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited,
      ]);
      return { exitCode, label, output: `${stdout}\n${stderr}`.trim() };
    })
  );
  for (const result of compilerResults) {
    if (!result) {
      continue;
    }
    const { label, exitCode } = result;
    const output = result.output.replaceAll("|", "\\|").replaceAll("\n", " ");
    if (label === "invalid" && (exitCode !== 1 || !output.includes("TS2322"))) {
      failures.push(`invalid compiler fixture expected TS2322; got ${exitCode} / ${output}`);
    }
    if (label === "valid" && exitCode !== 0) {
      failures.push(`valid compiler fixture exited ${exitCode}: ${output}`);
    }
    lines.push(`| TypeScript compiler ${label} fixture | ${exitCode} | ${output || "none"} |`);
  }
} finally {
  await rm(root, { force: true, recursive: true });
}

lines.push(
  "",
  "A bad fixture with exit 0 demonstrates a gap only for that case. A bad fixture rejected while its valid near-match exits 0 demonstrates coverage for the tested pattern. The naming pair shows no naming diagnostic for either `Leading_icon` or `thing`, leaving API vocabulary as a human judgment.",
  "",
  "The type-contract pair shows ordinary lint accepts both values while a direct TypeScript compiler invocation rejects the invalid value and accepts the valid one.",
  "",
  `This matrix contains ${probes.length} ordinary-lint pairs (${probes.length * 2} fixture runs): ${Object.keys(expectedBadRules).length} rejecting patterns and ${documentedLintGaps.size} explicit accepted-bad gaps. The separate compiler check adds two runs. Every valid near-match must pass, and every listed coverage/gap outcome is asserted by the probe script.`,
  "",
  "The JavaScript section's literal-hoisting case is covered by `useTopLevelRegex`; dynamic constructor memoization is not. `useFlatMap` catches `map().flat()`, while the section's `map().filter(Boolean)` example remains accepted. The paired flatMap replacement preserves empty-name filtering. Prop-array `sort()` inside `useMemo` is also accepted despite the section's `toSorted()` guidance. These observations establish no performance benefit without application measurements.",
  "",
  "The contract fixture rejects a non-null assertion, but a default branch hiding an omitted union member passes. `useDefaultSwitchClause` requires a default rather than proving union exhaustiveness; the valid fixture uses explicit cases and a `never` guard. This matrix does not claim that ordinary lint enforces exhaustive discriminated unions.",
  "",
  "Effect Events in dependency arrays are rejected by `useExhaustiveDependencies`. `noReactForwardRef` rejects the React 19 wrapper, but the source guidance intentionally preserves it for older React or library contracts. `useImageSize` covers explicit width/height in this fixture; the media guidance also permits known aspect ratios and addresses responsive delivery, loading priority, and fonts. `noSyncScripts` catches the external JSX script missing async/defer; it does not establish execution order correctness.",
  "",
  "## Source guidance links",
  "",
  "- React: `.agents/skills/react-best-practices/rules/{rerenders,effects-and-initialization,state,component-types,rendering,javascript}.md`.",
  "- Historical UI rules at 31885f0: `.agents/skills/ui-design/rules/{foreground-components,navigation-and-input,library-and-styling,typography}.md`.",
  "- TypeScript contracts: `.agents/skills/typescript/rules/contracts.md`. Predicates and narrowing here are paired syntax probes, not runtime validation tests.",
  "- Historical media guidance at 31885f0: `.agents/skills/ui-design/rules/media-and-fonts.md`.",
  "- Selected installed presets: `node_modules/ultracite/config/biome/{core,react}/biome.jsonc`, extended by `biome.json`. Rule names were checked against these presets, then tested through ordinary lint.",
  "- Current theme color ownership: `scripts/check-design-tokens.ts`.",
  "- Configured upstream a11y gaps: `noAutofocus` and `useUniqueElementIds` are disabled, so this matrix does not claim them as enforced.",
  ""
);
const evidence = join(process.cwd(), "docs/rearchitecture-goals/evidence/lint-fixtures.md");
await mkdir(join(process.cwd(), "docs/rearchitecture-goals/evidence"), { recursive: true });
await writeFile(evidence, lines.join("\n"));
console.log(`Wrote ${evidence}`);
if (failures.length > 0) {
  throw new Error(`Lint probe regression(s):\n${failures.join("\n")}`);
}
