import { analyzeDesignContracts, type ContractSource } from "./check-design-contracts";

interface Fixture {
  files: ContractSource[];
  lines?: number[];
  messageIncludes?: string[];
  name: string;
  rules: string[];
}
const source = (path: string, text: string): ContractSource => ({
  path,
  text: text.replaceAll("/**", "\n/**").replaceAll("*/", "*/\n"),
});
const family = (text: string, name = "session-actions", layer = "atoms") =>
  source(`src/components/${layer}/${name}/index.tsx`, text);
const doc =
  "/** Accepts text or button elements; interactive controls supply their own accessible names. */";
const fixtures: Fixture[] = [
  {
    files: [
      family(
        "export function SessionActions(props: { summary: React.ReactNode }) { return <div>{props.summary}</div>; }"
      ),
    ],
    name: "local slot with native spelling still needs docs",
    rules: ["contracts/propDocs", "contracts/slotDocs"],
  },
  {
    files: [
      source(
        "src/components/design-system/shared/settle.ts",
        'import { animate } from "motion"; export function settle(el: Element) { animate(el, { x: 0 }, { stiffness: 0 }); }'
      ),
    ],
    name: "a zero spring constant is a fixed spring choice",
    rules: ["contracts/motionProfile"],
  },
  {
    files: [
      source(
        "src/components/design-system/shared/press.ts",
        `
      import { animate as play } from "motion";
      const active = { duration: 0.65, ease: "easeOut" } as const;
      export function pulse(el: HTMLElement, reduced: boolean) { play(el, { opacity: 1 }, reduced ? { duration: 0 } : { ...active }); }
    `
      ),
    ],
    name: "fixed duration and easing passed to Motion through a local profile are rejected",
    rules: ["contracts/motionProfile", "contracts/motionProfile"],
  },
  {
    files: [
      source(
        "src/components/design-system/shared/panel.tsx",
        `
      import { motion as m } from "motion/react";
      export function Panel(){return <m.div transition={{ opacity: { ease: [0.2, 0.5, 0.3, 1] } }} />;}
    `
      ),
    ],
    name: "inline nested Motion JSX easing is rejected",
    rules: ["contracts/motionProfile"],
  },
  {
    files: [
      source(
        "src/components/design-system/shared/pulse.ts",
        `
      import * as effects from "motion";
      import { motion } from "./motion";
      export function pulse(el: HTMLElement, seconds: number, reduced: boolean) {
        effects.animate(el, { opacity: 1 }, { ...motion.palette.settle, duration: reduced ? 0 : seconds });
        const animate = (_el: unknown, _value: unknown, _options: unknown) => {};
        animate(el, 1, { duration: 5 });
      }
    `
      ),
    ],
    name: "catalog, zero or runtime durations and unrelated functions named animate are accepted",
    rules: [],
  },
  {
    files: [
      source(
        "src/components/design-system/button/probe.css",
        ".face {\n transition: opacity 120ms ease;\n backdrop-filter: blur(12px);\n}"
      ),
    ],
    lines: [2, 3],
    name: "raw system motion and backdrop materials fail at declaration locations",
    rules: ["contracts/motionProfile", "contracts/materialProfile"],
  },
  ...[
    "animation: reveal 1s ease-in-out 30ms 2 both",
    "animation-delay: -10ms",
    "transition-timing-function: ease, linear",
    "transition: opacity var(--sys-motion-control-feedback, 120ms)",
    "animation-duration: calc(var(--duration, 0s) + 10ms)",
    "-webkit-animation: reveal 1s step-start",
    "--private-duration: 120ms; transition-duration: var(--private-duration)",
  ].map((declaration) => ({
    files: [source("src/components/design-system/button/probe.css", `.face { ${declaration}; }`)],
    name: `literal motion profile rejected: ${declaration}`,
    rules: ["contracts/motionProfile"],
  })),
  {
    files: [
      source(
        "src/components/design-system/button/probe.css",
        `
      .face {
        transition: opacity var(--sys-motion-control-feedback), color var(--cmp-motion-button-feedback);
        animation: reveal var(--sys-motion-disclosure-enter) 0s 1 both;
        transition-duration: 0s, 0ms; animation-delay: 0;
        animation-timing-function: var(--cmp-motion-button-easing, var(--sys-motion-control-easing));
        transition-property: opacity, color; animation-name: reveal;
        transition: none; animation: inherit;
        --unrelated-axis: linear; --private-feedback: var(--sys-motion-control-feedback);
      }
      @media (prefers-reduced-motion: reduce) { .face { animation-duration: 0s; transition: none; } }
    `
      ),
    ],
    name: "motion profiles lists property names globals and reduced motion zeros accepted",
    rules: [],
  },
  ...[
    "-webkit-backdrop-filter: blur(.5rem)",
    "backdrop-filter: blur(calc(0px + 2px))",
    "backdrop-filter: var(--sys-filter-frost, blur(12px))",
    "--private-frost: blur(12px); backdrop-filter: var(--private-frost)",
  ].map((declaration) => ({
    files: [source("src/components/design-system/button/probe.css", `.face { ${declaration}; }`)],
    name: `raw backdrop material rejected: ${declaration}`,
    rules: ["contracts/materialProfile"],
  })),
  {
    files: [
      source(
        "src/components/design-system/styles/theme.css",
        ":root { --ref-filter-soft: blur(12px); --sys-filter-frost: var(--ref-filter-soft); --ref-motion-120: 120ms; --sys-motion-control-feedback: var(--ref-motion-120) ease; }"
      ),
      source(
        "src/components/design-system/button/probe.css",
        `
        .face { --cmp-filter-button-frost: blur(14px); backdrop-filter: var(--sys-filter-frost); -webkit-backdrop-filter: var(--cmp-filter-button-frost); }
        .flat { backdrop-filter: none; -webkit-backdrop-filter: blur(0px); }
        @supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) { .face { backdrop-filter: var(--sys-filter-frost); } }
      `
      ),
    ],
    name: "theme material and local component profiles zeros none and support probes accepted",
    rules: [],
  },
  {
    files: [
      source(
        "src/features/timer/style.css",
        ".face { transition: opacity 120ms ease; animation-delay: 1s; backdrop-filter: blur(12px); }"
      ),
    ],
    name: "product CSS may own motion and backdrop choices",
    rules: [],
  },
  {
    files: [
      source(
        "src/components/design-system/shared/reveal.tsx",
        "export function Reveal(){return <div/>}"
      ),
    ],
    name: "shared motion helpers have purposeful JSX names independent of family prefixes",
    rules: [],
  },
  {
    files: [
      source(
        "src/components/design-system/shared/reveal.tsx",
        "export function View(){return <div/>}"
      ),
    ],
    name: "shared motion helper still rejects placeholder JSX names",
    rules: ["contracts/componentName"],
  },
  {
    files: [
      source(
        "src/components/design-system/shared/settings.ts",
        "export type ChimeSettings = string;"
      ),
      family('export function Chip(){return <i data-ui="timer-chip"/>}', "chip", "design-system"),
    ],
    name: "shared type exports and JSX-only hooks use neutral names",
    rules: ["contracts/systemName", "contracts/systemName"],
  },
  {
    files: [
      source(
        "src/features/editor/style.css",
        ".editor :is(.dial-face,.dial-rotor) { opacity: .4 }"
      ),
    ],
    name: "feature styles cannot target the public dial's private face or rotor",
    rules: ["contracts/privateDialSelector", "contracts/privateDialSelector"],
  },
  {
    files: [
      source(
        "src/features/editor/style.css",
        ".editor:has(.dial) { --cmp-size-dial-diameter: 10rem; --cmp-space-button-frost-inset: 8px } .dial-face-preview { display: block }"
      ),
    ],
    name: "layout, public root properties and near matches remain available",
    rules: [],
  },
  {
    files: [
      family(
        'import "@/features/timer/style.css"; export { entry } from "../../../features/editor/data";',
        "chip",
        "design-system"
      ),
      source("src/features/editor/data.ts", "export const entry = 1;"),
    ],
    name: "system rejects aliased imports and relative re-exports of feature code",
    rules: ["contracts/systemImport", "contracts/systemImport"],
  },
  {
    files: [
      source(
        "src/components/design-system/shared/load.ts",
        'export async function load() { return import("/src/features/editor/tools"); }'
      ),
    ],
    name: "dynamic system imports cannot load product code",
    rules: ["contracts/systemImport"],
  },
  {
    files: [
      source(
        "src/components/design-system/chip/style.css",
        '@import url("../../../features/editor/colors.css") layer(base); @import "@/features/catalog/shapes.css";'
      ),
    ],
    name: "system styles reject both CSS import spellings across feature boundaries",
    rules: ["contracts/systemImport", "contracts/systemImport"],
  },
  {
    files: [
      source(
        "src/components/design-system/chip/style.css",
        '@import "../shared/ink.css"; .chip { --cmp-color-chip-ink: currentColor }'
      ),
      family(
        'import "react"; import "@/components/design-system/button/style.css"; export function Chip() {return <i/>}',
        "chip",
        "design-system"
      ),
    ],
    name: "system-owned and external imports work with neutral styling names",
    rules: [],
  },
  {
    files: [
      family(
        'export function ChipTimer(props: { /** Select the enabled status for this item. */ chimeEnabled: boolean; /** Sets the visible emphasis on the label. */ emphasis: "warmup" | "high" }) { return <i>{props.emphasis}</i> }',
        "chip",
        "design-system"
      ),
    ],
    name: "domain-specific export, prop and variant names fail independently",
    rules: ["contracts/systemName", "contracts/systemName", "contracts/systemName"],
  },
  {
    files: [
      family("export function TimerLabel() { return <span/>; }", "timer-label", "molecules"),
      source(
        "src/components/molecules/timer-label/style.css",
        ".timer-label { --cmp-color-timer-label: currentColor; }"
      ),
    ],
    name: "product-specific names are accepted in an app-owned molecule",
    rules: [],
  },
  {
    files: [
      source(
        "src/components/design-system/chip/style.css",
        ".timer-chip, [data-slot='chime-choice'] { --cmp-color-chakra-fill: red }"
      ),
    ],
    name: "product terms cannot enter system selector hooks or variables",
    rules: ["contracts/systemName", "contracts/systemName", "contracts/systemName"],
  },
  {
    files: [
      source("src/components/design-system/timer-panel/style.css", ".panel { display: flex }"),
    ],
    name: "system filenames expose reusable roles",
    rules: ["contracts/systemName"],
  },
  {
    files: [
      source(
        "src/components/molecules/summary/summary-panel.tsx",
        "export function SummaryPanel(props: { thing: string }) { return <span>{props.thing}</span>; }"
      ),
    ],
    name: "directly exported submodule props are checked",
    rules: ["contracts/propName", "contracts/propDocs"],
  },
  {
    files: [
      family("export function InputAffix() { return <span/>; }", "input-group", "design-system"),
    ],
    name: "design-system compound prefix rejected",
    rules: ["contracts/componentName"],
  },
  {
    files: [
      family(
        "export function InputGroupAffix() { return <span/>; }",
        "input-group",
        "design-system"
      ),
    ],
    name: "design-system compound prefix accepted",
    rules: [],
  },
  {
    files: [
      family("function SessionActions() { return <div/>; } export { SessionActions as Root };"),
    ],
    name: "generic alias rejected at the public name",
    rules: ["contracts/componentName"],
  },
  {
    files: [
      family(
        "export function ActionGroup() { return <div/>; } export function TimerSummary() { return <p/>; }"
      ),
    ],
    name: "purposeful distinct atom exports accepted",
    rules: [],
  },
  {
    files: [
      family('export { Internal as SessionActions } from "./implementation";'),
      source(
        "src/components/atoms/session-actions/implementation.tsx",
        "export function Internal(props: { thing: string }) { return <p>{props.thing}</p>; }"
      ),
    ],
    name: "reexport follows source props",
    rules: ["contracts/propName", "contracts/propDocs"],
  },
  {
    files: [
      family('export * from "./implementation";'),
      source(
        "src/components/atoms/session-actions/implementation.tsx",
        "export function Trigger() { return <button/>; }"
      ),
    ],
    name: "star reexport audits the submodule and its public entrypoint",
    rules: ["contracts/componentName", "contracts/componentName"],
  },
  {
    files: [
      family(
        'import { memo } from "react"; const Inner = (props: { thing: string }) => <p>{props.thing}</p>; export const SessionActions = memo(Inner);'
      ),
    ],
    name: "memo wrapper follows inferred public props",
    rules: ["contracts/propName", "contracts/propDocs"],
  },
  {
    files: [
      family(
        'import { forwardRef } from "react"; export const SessionActions = forwardRef<HTMLDivElement, { thing: string }>((props, ref) => <div ref={ref}>{props.thing}</div>);'
      ),
    ],
    name: "forwardRef wrapper follows public props",
    rules: ["contracts/propName", "contracts/propDocs"],
  },
  {
    files: [
      family(
        `import { memo } from "react"; type Props = React.ComponentProps<"button"> & { ${doc} actionContent?: React.ReactNode }; const Inner = (props: Props) => <button>{props.actionContent}</button>; const Wrapped = memo(Inner); export { Wrapped as SessionActions };`
      ),
    ],
    name: "valid wrapper alias with platform props accepted",
    rules: [],
  },
  {
    files: [family("export const SessionActions = () => ({ arbitrary: true });")],
    name: "PascalCase helper must actually return JSX",
    rules: ["contracts/jsxExport"],
  },
  {
    files: [family("export function sessionActions() { return <p/>; }")],
    name: "lowercase JSX export rejected",
    rules: ["contracts/componentName"],
  },
  {
    files: [family("export const countActions = () => 3; export type Root = { thing: string };")],
    name: "noncomponent helpers and type-only exports accepted",
    rules: [],
  },
  {
    files: [
      family(
        "type Props = { /** Displays supplied content within the action area. */ actionContent: React.ReactNode }; export function SessionActions(p: Props) { return <div>{p.actionContent}</div>; }"
      ),
    ],
    name: "slot docs must describe interaction and naming",
    rules: ["contracts/slotDocs"],
  },
  {
    files: [
      family(
        `interface Props { ${doc} actionContent: React.ReactNode } export function SessionActions(p: Props) { return <div>{p.actionContent}</div>; }`
      ),
    ],
    name: "slot docs with accepted content interaction and naming accepted",
    rules: [],
  },
  {
    files: [
      family(
        "type Slots = { /** Displays supplied content within the action area. */ actionContent: React.ReactNode }; interface Options { /** Content contracts for the displayed action area. */ slots: Slots }; type Props = Options | { /** Hide the action area entirely. */ hidden: true }; export function SessionActions(p: Props) { return <div/>; }"
      ),
    ],
    name: "nested union aliases preserve owned slot docs",
    rules: ["contracts/slotDocs"],
  },
  {
    files: [
      family(
        'export function Button(p: { /** Chooses how the control is displayed. */ mode: "solid" }) { return <button/>; }',
        "button",
        "design-system"
      ),
    ],
    name: "ambiguous Button mode rejected",
    rules: ["contracts/propName"],
  },
  {
    files: [
      family(
        "export function SessionActions(p: { /** Chooses how the actions are displayed. */ Action_Style: string }) { return <div/>; }"
      ),
    ],
    name: "prop casing rejected",
    rules: ["contracts/propName"],
  },
  {
    files: [
      family(
        "export function SessionActions(p: { /** The value. */ emphasis: string }) { return <div/>; }"
      ),
    ],
    name: "vacuous property docs rejected",
    rules: ["contracts/propDocs"],
  },
  {
    files: [
      family(
        "export function SessionActions(p: { /** Called when the preview button is activated. */ onPreview: () => void }) { return <div/>; }"
      ),
    ],
    name: "repeated preview callback contract required",
    rules: ["contracts/callbackRepeat"],
  },
  {
    files: [
      family(
        "export function SessionActions(p: { /** Controls the current preview state. */ onPreview: () => void }) { return <div/>; }"
      ),
    ],
    name: "callback must state trigger",
    rules: ["contracts/callbackDocs", "contracts/callbackRepeat"],
  },
  {
    files: [
      family(
        'interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> { /** Called on every activation, including repeated previews of the same sound. */ onPreview: () => void; id?: string; "aria-label"?: string; onClick?: React.MouseEventHandler<HTMLButtonElement> } export function SessionActions(p: Props) { return <button/>; }'
      ),
    ],
    name: "repeatable callback and platform declarations accepted",
    rules: [],
  },
  {
    files: [
      family(
        'import { Button } from "@base-ui/react/button"; export function SessionActions(props: React.ComponentProps<typeof Button>) { return <Button {...props}/>; }'
      ),
    ],
    name: "Base UI inherited contracts accepted",
    rules: [],
  },
  {
    files: [
      source(
        "src/components/design-system/styles/theme.css",
        ":root { --color-ink: red; --sys-color-thing: red; --cmp-color-ButtonFill: red; --sys-weird-ink: red; }"
      ),
    ],
    name: "theme ownership and purpose rejected",
    rules: [
      "contracts/tokenName",
      "contracts/tokenName",
      "contracts/tokenName",
      "contracts/tokenName",
    ],
  },
  {
    files: [
      source(
        "src/components/design-system/styles/theme.css",
        ":root { --ref-color-pigment-ruby: red; --sys-color-ink-muted: red; --cmp-shadow-button-pressed: none; --ref-space-0: 0; --sys-space-control-gap: 1px; --sys-motion-disclosure-enter: 1s; }"
      ),
    ],
    name: "scoped property purpose tokens accepted",
    rules: [],
  },
  {
    files: [
      source("src/components/design-system/button/style.css", ".face { --cmp-space-thing: 4px; }"),
      source("src/features/timer/style.css", ".start { --cmp-typo-button-inset: 4px; }"),
      source("src/index.css", ":root { --sys-color-Foreground: white; }"),
    ],
    name: "public token declarations follow the naming contract outside the theme",
    rules: ["contracts/tokenName", "contracts/tokenName", "contracts/tokenName"],
  },
  {
    files: [
      source(
        "src/components/design-system/button/style.css",
        ".face { --local-offset: 1px; --cmp-size-button-icon: 3rem; --cmp-align-summary: end; --sys-opacity-ink-muted-alpha: .5; }"
      ),
    ],
    name: "component size, alignment, opacity and private implementation variables coexist",
    rules: [],
  },
  {
    files: [
      source(
        "src/components/design-system/styles/olyx-compat.css",
        ":root { --color-primary: var(--sys-color-action-primary); }"
      ),
    ],
    name: "Olyx alias only allowed in separate compatibility file",
    rules: [],
  },
  {
    files: [
      source("src/components/design-system/styles/theme.css", ":root { --sys-color-ink: red;"),
    ],
    name: "malformed stylesheet fails closed",
    rules: ["contracts/cssParse"],
  },
  {
    files: [
      source("src/components/design-system/shared/motion.ts", "export const fastDuration = 0.2;"),
    ],
    name: "loose motion constants rejected",
    rules: ["contracts/motionGroup"],
  },
  {
    files: [
      source(
        "src/components/design-system/shared/motion.ts",
        'export const motion = { control: { settle: { type: "spring" } }, disclosure: { enter: { duration: 0.2 }, exit: { duration: 0.1 } }, scene: { blackout: { duration: 1 }, reveal: { duration: 1 } } } as const;'
      ),
    ],
    name: "motion catalog interaction and phase accepted",
    rules: [],
  },
  {
    files: [
      source(
        "src/components/design-system/shared/motion.ts",
        "export const motion = { disclosure: { duration: 0.2, easing: 0.1 } } as const;"
      ),
    ],
    name: "motion catalog loose fields rejected",
    rules: ["contracts/motionPhase"],
  },
  {
    files: [family('export { Missing as SessionActions } from "./missing";')],
    name: "unresolved named export fails closed",
    rules: ["contracts/unresolvedExport"],
  },
  {
    files: [family('export const broken = "unfinished')],
    name: "component source syntax fails closed",
    rules: ["contracts/parse"],
  },
  {
    files: [
      source(
        "src/components/design-system/styles/olyx-compat.css",
        ":root { --color-primary: red; }"
      ),
    ],
    name: "compatibility file requires actual aliases",
    rules: ["contracts/tokenName"],
  },
  {
    files: [family('export * from "./missing";')],
    name: "unresolved star export fails closed",
    rules: ["contracts/unresolvedExport"],
  },
  {
    files: [family("export function ACTIONS() { return <div/>; }")],
    name: "uppercase-only JSX name rejected",
    rules: ["contracts/componentName"],
  },
  {
    files: [
      family(
        "interface Item { thing: string } interface Props { /** Describes each visible action in the group. */ items: Item[] } export function SessionActions(p: Props) { return <div/>; }"
      ),
    ],
    name: "nested array item contracts checked",
    rules: ["contracts/propName", "contracts/propDocs"],
  },
  {
    files: [
      family(
        "export function ChoiceGroup<T>(props: { /** Typed choices available for the caller to select. */ options: T[] }) { return <div/>; }",
        "choice-group",
        "molecules"
      ),
    ],
    name: "typed generic ChoiceGroup options accepted",
    rules: [],
  },
  {
    files: [
      family(
        "export function SessionActions(props: { /** Typed configuration for how actions are arranged. */ config: { /** Number of columns used to display actions. */ columns: number }; /** Values rendered as each action label. */ data: string[] }) { return <div/>; }"
      ),
    ],
    name: "purposeful typed config and data accepted",
    rules: [],
  },
  {
    files: [family("export function Buttonish() { return <button/>; }", "button", "design-system")],
    name: "compound ownership requires PascalCase part boundary",
    rules: ["contracts/componentName"],
  },
  {
    files: [
      source(
        "src/components/design-system/styles/upstream-compatibility.css",
        ":root { --color-primary: var(--sys-color-action-primary); }"
      ),
    ],
    name: "alternate compatibility filename cannot exempt upstream aliases",
    rules: ["contracts/tokenName"],
  },
  {
    files: [
      family(
        "export function SessionActions(props: { onClick: (sound: string) => void }) { return <div/>; }"
      ),
    ],
    name: "local callback with native spelling and custom contract still needs docs",
    rules: ["contracts/propDocs", "contracts/callbackDocs"],
  },
  {
    files: [
      family(
        "export function SessionActions(props: { /** Called when a caller requests a sound preview. */ onClick: (sound: string) => void }) { return <div/>; }"
      ),
    ],
    name: "local callback with native spelling and documented custom contract accepted",
    rules: [],
  },
  {
    files: [
      family(
        'interface Props { id?: string; ref?: React.Ref<HTMLDivElement>; "aria-label"?: string; onClick?: React.MouseEventHandler<HTMLDivElement> } export function SessionActions(p: Props) { return <div/>; }'
      ),
    ],
    name: "local transport attributes and native ref signatures accepted",
    rules: [],
  },
  {
    files: [
      source(
        "src/features/timer/style.css",
        '.start [data-frost] { opacity: .9; } .start > [data-ripple="pressure"] { opacity: .8; }'
      ),
    ],
    messageIncludes: ['appearance="inset"', "button root"],
    name: "feature CSS cannot style private frost or ripple layers",
    rules: ["contracts/privateButtonSelector", "contracts/privateButtonSelector"],
  },
  {
    files: [
      source(
        "src/features/timer/style.css",
        ".start:is([data-frost], .plain):has(> [data-ripple]) { opacity: .9; }"
      ),
    ],
    name: "feature functional selector arguments cannot target private layers",
    rules: ["contracts/privateButtonSelector", "contracts/privateButtonSelector"],
  },
  {
    files: [
      source(
        "src/features/timer/style.css",
        ".start:nth-child(2n of :where([data-ripple])) { opacity: .9; }"
      ),
    ],
    name: "feature nth-child of and where selectors cannot target private layers",
    rules: ["contracts/privateButtonSelector"],
  },
  {
    files: [
      source("src/features/timer/style.css", "[data-fro\\73t], [DATA-RIPPLE] { opacity: .9; }"),
    ],
    name: "escaped and uppercase private attribute names are recognized",
    rules: ["contracts/privateButtonSelector", "contracts/privateButtonSelector"],
  },
  {
    files: [
      source(
        "src/features/timer/style.css",
        '/* [data-frost] */ [data-frost-control], [data-ripple-count], [data-kind="data-frost"], [data-note="[data-ripple]"], :is([data-kind="data-ripple"]) { content: "[data-frost]"; }'
      ),
    ],
    name: "similar attribute names quoted values and comments are not private selectors",
    rules: [],
  },
  {
    files: [
      source(
        "src/components/design-system/button/style.css",
        "[data-frost], :is([data-ripple]) { opacity: .9; }"
      ),
    ],
    name: "design-system CSS owns frost and ripple selectors",
    rules: [],
  },
  {
    files: [source("src/features/timer/style.css", ".start[data-frost { opacity: .9; }")],
    name: "feature selector syntax fails closed",
    rules: ["contracts/cssParse"],
  },
  {
    files: [
      source(
        "src/features/timer/style.css",
        "@media (hover: hover) {\n .start {\n  & [data-frost] { opacity: .9; }\n }\n}"
      ),
    ],
    lines: [3],
    name: "feature private-selector diagnostics retain source rule locations through media and nesting",
    rules: ["contracts/privateButtonSelector"],
  },
];
let failed = 0;
for (const fixture of fixtures) {
  const diagnostics = analyzeDesignContracts(fixture.files);
  const actual = diagnostics.map((item) => item.rule).sort();
  const rulesMatch = JSON.stringify(actual) === JSON.stringify([...fixture.rules].sort());
  const guidanceMatches = (fixture.messageIncludes ?? []).every((text) =>
    diagnostics.every((item) => item.message.includes(text))
  );
  const locationsMatch =
    !fixture.lines ||
    JSON.stringify(diagnostics.map((item) => item.line)) === JSON.stringify(fixture.lines);
  const passed = rulesMatch && guidanceMatches && locationsMatch;
  console.log(`${passed ? "PASS" : "FAIL"} ${fixture.name}`);
  if (!passed) {
    failed += 1;
    console.error(JSON.stringify({ diagnostics, expected: fixture.rules }, null, 2));
  }
}
console.log(`${fixtures.length - failed}/${fixtures.length} design contract fixtures passed.`);
if (failed) {
  process.exitCode = 1;
}
