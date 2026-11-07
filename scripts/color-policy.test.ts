import { describe, expect, it } from "vitest";
import { checkColorSource, colorOwner } from "./color-policy";

describe("static color ownership", () => {
  it.each([
    ["CSS named color", "probe.css", "a{color:red}"],
    ["CSS functional color", "probe.css", "a{color:oklch(40% .2 20)}"],
    ["gradient var", "probe.css", "a{background:linear-gradient(var(--ink),red)}"],
    ["gradient fallback", "probe.css", "a{background:linear-gradient(red,var(--ink,blue))}"],
    ["shadow", "probe.css", "a{box-shadow:0 0 1px tan}"],
    ["opaque custom hex", "probe.css", "a{--x:#fff}"],
    ["custom color name", "probe.css", "a{--sys-color-ink:red}"],
    ["custom declaration", "probe.css", "a{--paint:rebeccapurple}"],
    ["nested custom fallback", "probe.css", "a{color:var(--ink,var(--fallback,#fff))}"],
    ["dynamic alpha", "probe.css", "a{color:rgb(1 2 3 / var(--alpha))}"],
    ["mixed semantic color", "probe.css", "a{color:color-mix(in srgb,var(--ink),red)}"],
    ["JSX paint", "probe.tsx", 'const view=<svg><g fill="red" /></svg>'],
    ["JSX style", "probe.tsx", 'const view=<div style={{color:"red"}}/>'],
    [
      "local alias",
      "probe.tsx",
      'const pigment="red";const alias=pigment;const view=<g fill={alias}/>',
    ],
    ["typed alias", "probe.tsx", 'const pigment="red" as const;const color=pigment'],
    ["renderer", "probe.ts", 'getShaderColorFromString("red")'],
    ["renderer array", "probe.tsx", 'const view=<Mesh colors={["red", "var(--ink)"]}/>'],
    ["canvas", "probe.ts", 'ctx.fillStyle="red";ctx.addColorStop(0,"blue")'],
    ["property setter", "probe.ts", 'style.setProperty("--paint","red")'],
    // biome-ignore lint/suspicious/noTemplateCurlyInString: This fixture is source code containing a template.
    ["template static stop", "probe.ts", "const color=`linear-gradient(red,${paint})`"],
    ["SVG attribute", "probe.svg", '<svg><path fill="red"/></svg>'],
    ["SVG inline style", "probe.svg", '<svg><path style="fill:red"/></svg>'],
    ["SVG style block", "probe.svg", "<svg><style>.icon{fill:red}</style></svg>"],
  ])("rejects %s", (_label, file, source) => {
    expect(
      checkColorSource(file, source).some((item) => item.message.includes("Literal paint"))
    ).toBe(true);
  });

  it.each([
    [
      "semantic paints",
      "probe.css",
      "a{color:var(--ink);fill:currentColor;background:transparent}",
    ],
    ["platform light dark", "probe.css", "a{color:light-dark(Canvas,CanvasText)}"],
    ["platform paint", "probe.css", "a{color:CanvasText;background:Canvas}"],
    ["semantic fallback", "probe.css", "a{color:var(--ink,currentColor)}"],
    ["derived relative", "probe.css", "a{color:rgb(from var(--ink) r g b / 50%)}"],
    ["dynamic channels", "probe.css", "a{color:rgb(var(--channels) / 50%)}"],
    ["non-paint custom identifiers", "probe.css", "a{--font-family:tan;--animation-name:red}"],
    ["non-paint CSS words", "probe.css", "a{font-family:tan;animation:red 1s}"],
    [
      "labels classes paths",
      "probe.tsx",
      'import red from "red";const label="red";const view=<div className="red" title="red">red</div>',
    ],
    ["semantic alias", "probe.tsx", 'const pigment="var(--ink)";const view=<g fill={pigment}/>'],
    ["dynamic channels", "probe.ts", `const color=\`rgb(\${channels.join(" ")})\``],
    // biome-ignore lint/suspicious/noTemplateCurlyInString: This fixture is source code containing a template.
    ["dynamic hex", "probe.ts", "const color=`#${hex}`"],
    ["SVG reference", "probe.svg", '<svg><path fill="url(#red)" stroke="currentColor"/></svg>'],
    [
      "XML declaration",
      "probe.svg",
      '<?xml version="1.0"?>\n<svg><path fill="currentColor"/></svg>',
    ],
    ["owner", colorOwner, ":root{--ink:red}"],
  ])("accepts %s", (_label, file, source) => {
    expect(checkColorSource(file, source)).toEqual([]);
  });

  it("reports parser failures rather than skipping files", () => {
    for (const [file, source] of [
      ["probe.css", "a{color:rgb(}"],
      ["probe.tsx", "const ="],
      ["probe.svg", "<!DOCTYPE svg><svg/>"],
    ]) {
      expect(checkColorSource(file, source)[0]?.message).toContain("could not parse");
    }
  });

  it("gives source locations and an actionable owner", () => {
    expect(checkColorSource("probe.tsx", '\nconst view=<g fill="red"/>')[0]).toMatchObject({
      column: 20,
      file: "probe.tsx",
      line: 2,
      message: expect.stringContaining(colorOwner),
    });
  });

  it("accepts parameter shadows without resolving an unrelated const", () => {
    expect(
      checkColorSource(
        "probe.tsx",
        'const pigment="red";function swatch(pigment:string){return <g fill={pigment}/>}'
      )
    ).toEqual([]);
  });

  it("checks static template substitutions and aliases", () => {
    // biome-ignore lint/suspicious/noTemplateCurlyInString: This fixture is source code containing a template.
    const source = 'const pigment="red";const color=`linear-gradient(${pigment},var(--ink))`';
    expect(checkColorSource("probe.ts", source)[0]?.message).toContain("Literal paint");
  });

  it("locates CSS rules", () => {
    expect(checkColorSource("probe.css", "\n\na{color:red}")[0]).toMatchObject({
      column: 1,
      line: 3,
    });
  });

  it("does not pretend to trace cross-module or computed paints", () => {
    expect(
      checkColorSource("probe.tsx", 'import {ink} from "./palette";const view=<g fill={ink}/>')
    ).toEqual([]);
    expect(checkColorSource("probe.tsx", 'const color=computePaint("red")')).toEqual([]);
  });
});
