import { parse } from "@babel/parser";
import { transform } from "lightningcss";

export const colorOwner = "src/components/design-system/styles/theme.css";
export interface ColorDiagnostic {
  column: number;
  file: string;
  line: number;
  message: string;
}

// These are paint entry points, not a vocabulary ban on words such as “red”.
const paintName =
  /^(?:.*color(?:s)?|fill|stroke|background(?:image)?|(?:box|text)?shadow|border(?:top|right|bottom|left)?|outline|stopcolor|floodcolor|lightingcolor|caretcolor|accentcolor)$/iu;
const customPaintName =
  /(?:^|-)color(?:-|$)|(?:^|-)(?:paint|fill|stroke|background|shadow)(?:-|$)/iu;
const normalize = (name: string) => name.replaceAll("-", "");
const isPaint = (name: string) => name.startsWith("--") || paintName.test(normalize(name));
const styleName = /^(?:css|style|styles)$/iu;
const isStyle = (name: string) => styleName.test(name);
const xmlDeclaration = /<\?xml[^?]*\?>/u;
const svgStyle = /(?<opening><style\b[^>]*>)(?<css>[\s\S]*?)(?<closing><\/style>)/giu;
const notNewline = /[^\n]/gu;
const canvasStyle = /^(?:fill|stroke)Style$/u;
const renderer = /(?:getShaderColorFromString|addColorStop|(?:fill|stroke)Style|setProperty)$/u;

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function isLiteralColor(value: unknown): boolean {
  const color = record(value);
  // System colors and currentColor are parsed as strings. Zero alpha is transparent.
  if (color?.type === "light-dark") {
    return isLiteralColor(color.light) || isLiteralColor(color.dark);
  }
  return !!color && color.type !== "currentcolor" && color.alpha !== 0;
}

const namedColors = new Map<string, boolean>();
function isNamedColor(value: string): boolean {
  const cached = namedColors.get(value);
  if (cached !== undefined) {
    return cached;
  }
  let literal = false;
  try {
    const visitColor = (color: unknown) => {
      literal ||= isLiteralColor(color);
    };
    transform({
      code: Buffer.from(`a{color:${value}}`),
      filename: "color-name.css",
      visitor: { Color: visitColor },
    });
  } catch {
    /* Non-color identifiers are valid in unparsed/custom declarations. */
  }
  namedColors.set(value, literal);
  return literal;
}

function isTokenLiteral(node: Record<string, unknown>, namedPaint: boolean): boolean {
  if (node.type === "color") {
    return isLiteralColor(node.value);
  }
  if (namedPaint && node.type === "ident" && typeof node.value === "string") {
    return isNamedColor(node.value);
  }
  // Static channels with dynamic alpha still introduce a literal color.
  const color = node.type === "unresolved-color" ? record(node.value) : undefined;
  return !!color && Object.values(color).some((channel) => typeof channel === "number");
}

/** Parsed CSS, including custom values and var() fallbacks. No source regex scanner. */
function inspectCss(
  css: string,
  report: (message: string, line?: number, column?: number) => void
) {
  let line = 1;
  let column = 1;
  let found = false;
  let namedPaint = false;
  const mark = () => {
    found = true;
  };
  const tokens = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(tokens);
      return;
    }
    const node = record(value);
    if (!node) {
      return;
    }
    if (isTokenLiteral(node, namedPaint)) {
      mark();
    }
    // URL fragments/paths and custom property names are identifiers, not paints.
    if (node.type === "url") {
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (key !== "name") {
        tokens(child);
      }
    }
  };
  transform({
    code: Buffer.from(css),
    filename: "color-policy.css",
    visitor: {
      Color(color) {
        if (isLiteralColor(color)) {
          mark();
        }
      },
      Declaration(declaration) {
        found = false;
        namedPaint =
          declaration.property === "custom" ? customPaintName.test(declaration.value.name) : true;
        if (
          declaration.property === "custom" ||
          (declaration.property === "unparsed" && isPaint(declaration.value.propertyId.property))
        ) {
          tokens(declaration.value);
        }
      },
      DeclarationExit() {
        if (found) {
          report(
            `Literal paint belongs in ${colorOwner}; use a semantic var() reference.`,
            line,
            column
          );
        }
      },
      Rule(rule) {
        const location = record(record(record(rule)?.value)?.loc);
        if (typeof location?.line === "number" && typeof location.column === "number") {
          line = location.line + 1;
          ({ column } = location);
        }
      },
    },
  });
}

// A small structural view keeps the traversal independent of unstable compiler APIs.
interface AstNode {
  loc?: { start: { line: number; column: number } };
  type: string;
  [key: string]: unknown;
}
function asNode(value: unknown): AstNode | undefined {
  const object = record(value);
  return typeof object?.type === "string" ? (object as AstNode) : undefined;
}
function children(node: AstNode): AstNode[] {
  return Object.values(node)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .flatMap((value) => {
      const child = asNode(value);
      return child ? [child] : [];
    });
}
function nameOf(value: unknown): string {
  const node = asNode(value);
  if (!node) {
    return "";
  }
  if (typeof node.name === "string") {
    return node.name;
  }
  if (typeof node.value === "string") {
    return node.value;
  }
  return nameOf(node.property);
}

type Reporter = (message: string, line?: number, column?: number) => void;

function svgInput(source: string, report: Reporter): string {
  // Isolate raw CSS before JSX interprets its braces as JavaScript.
  return source
    .replace(xmlDeclaration, (text) => text.replace(notNewline, " "))
    .replace(
      svgStyle,
      (_match: string, opening: string, css: string, closing: string, offset: number) => {
        const line = source.slice(0, offset + opening.length).split("\n").length;
        inspectCss(css, (message, cssLine = 1) => report(message, line + cssLine - 1));
        return opening + css.replace(notNewline, " ") + closing;
      }
    );
}

function nodesOf(root: AstNode): AstNode[] {
  const all = [root];
  for (const node of all) {
    all.push(...children(node));
  }
  return all;
}

function bindingsOf(all: AstNode[]): Map<string, AstNode | null> {
  const bindings = new Map<string, AstNode | null>();
  for (const node of all) {
    if (node.type !== "VariableDeclaration") {
      continue;
    }
    for (const entry of node.declarations as AstNode[]) {
      if (asNode(entry.id)?.type !== "Identifier") {
        continue;
      }
      const name = nameOf(entry.id);
      const init = asNode(entry.init);
      bindings.set(name, bindings.has(name) || node.kind !== "const" || !init ? null : init);
    }
  }
  discardShadowedBindings(all, bindings);
  return bindings;
}

function discardShadowedBindings(all: AstNode[], bindings: Map<string, AstNode | null>) {
  // No lexical scope engine: conservatively discard aliases shadowed by parameters,
  // imports, destructuring, catch bindings or other declarations of the same name.
  const invalidate = (value: unknown): void => {
    const node = asNode(value);
    if (!node) {
      return;
    }
    if (node.type === "Identifier") {
      bindings.set(nameOf(node), null);
      return;
    }
    for (const child of children(node)) {
      invalidate(child);
    }
  };
  for (const node of all) {
    for (const parameter of (node.params as unknown[] | undefined) ?? []) {
      invalidate(parameter);
    }
    if (node.type.startsWith("Import") || node.type === "CatchClause") {
      invalidate(node.local ?? node.param);
    }
    if (node.type === "VariableDeclarator" && asNode(node.id)?.type !== "Identifier") {
      invalidate(node.id);
    }
    if (node.type === "FunctionDeclaration" || node.type === "ClassDeclaration") {
      invalidate(node.id);
    }
  }
}

class PaintInspector {
  private readonly bindings: Map<string, AstNode | null>;
  private readonly report: Reporter;

  constructor(bindings: Map<string, AstNode | null>, report: Reporter) {
    this.bindings = bindings;
    this.report = report;
  }

  private cssValue(text: string, node: AstNode, property: string, dynamic = false) {
    const location = node.loc?.start;
    try {
      inspectCss(
        isStyle(property)
          ? `a{${text}}`
          : `a{${property.startsWith("--") ? property : "background"}:${text}}`,
        (message) => this.report(message, location?.line, (location?.column ?? 0) + 1)
      );
    } catch (error) {
      // Babel already parsed the source. A runtime fragment such as `#${hex}`
      // cannot be represented by a CSS var placeholder; retain it for review.
      if (!dynamic) {
        throw error;
      }
    }
  }

  private staticText(node: AstNode | undefined, seen = new Set<string>()): string | undefined {
    if (!node) {
      return undefined;
    }
    if (node.type === "StringLiteral" || node.type === "NumericLiteral") {
      return String(node.value);
    }
    const name = nameOf(node);
    const binding = this.bindings.get(name);
    return node.type === "Identifier" && binding && !seen.has(name)
      ? this.staticText(binding, new Set([...seen, name]))
      : undefined;
  }

  expression(node: AstNode | undefined, property: string, seen = new Set<string>()): void {
    if (!node) {
      return;
    }
    switch (node.type) {
      case "StringLiteral":
        this.cssValue(String(node.value), node, property);
        return;
      case "TemplateLiteral": {
        const expressions = node.expressions as AstNode[];
        const dynamic = expressions.some((expression) => this.staticText(expression) === undefined);
        const text = (node.quasis as AstNode[])
          .map(
            (quasi, index) =>
              String(record(quasi.value)?.cooked ?? "") +
              (index < expressions.length
                ? (this.staticText(expressions[index]) ?? "var(--runtime-color)")
                : "")
          )
          .join("");
        this.cssValue(text, node, property, dynamic);
        return;
      }
      case "Identifier": {
        const name = nameOf(node);
        const binding = this.bindings.get(name);
        if (binding && !seen.has(name)) {
          this.expression(binding, property, new Set([...seen, name]));
        }
        return;
      }
      case "ObjectExpression":
        for (const prop of node.properties as AstNode[]) {
          this.entry(prop, seen);
        }
        return;
      case "ArrayExpression":
      case "ConditionalExpression":
      case "TSAsExpression":
      case "TSSatisfiesExpression":
      case "TSNonNullExpression":
        for (const child of children(node)) {
          this.expression(child, property, seen);
        }
        return;
      default:
        return;
    }
  }

  private entry(node: AstNode, seen = new Set<string>()) {
    const key = nameOf(node.name ?? node.key ?? node.id);
    if (!(isPaint(key) || isStyle(key))) {
      return;
    }
    const value = asNode(node.value ?? node.init);
    this.expression(
      value?.type === "JSXExpressionContainer" ? asNode(value.expression) : value,
      key,
      seen
    );
  }

  visit(node: AstNode) {
    switch (node.type) {
      case "JSXAttribute":
      case "ObjectProperty":
      case "VariableDeclarator":
        this.entry(node);
        return;
      case "CallExpression": {
        const callee = nameOf(node.callee);
        if (!renderer.test(callee)) {
          return;
        }
        const args = node.arguments as AstNode[];
        const property = callee === "setProperty" ? nameOf(args[0]) : "color";
        if (isPaint(property)) {
          this.expression(
            args[callee === "setProperty" || callee === "addColorStop" ? 1 : 0],
            property
          );
        }
        return;
      }
      case "AssignmentExpression": {
        const key = nameOf(node.left);
        if (isPaint(key) || canvasStyle.test(key)) {
          this.expression(asNode(node.right), "color");
        }
        return;
      }
      default:
        return;
    }
  }
}

/**
 * Static CSS and recognized TS/JSX paint/style/renderer entry points, including
 * unique local const initializers. Computation, mutation, cross-module alias flow,
 * shadowed bindings and numeric renderer arrays require review. Named colors in
 * opaque custom properties require review; explicit hex/functions are unambiguous.
 * CSS locations identify the owning rule start. SVG uses JSX;
 * unsupported XML syntax fails visibly. Unused-token analysis is deliberately absent:
 * declarations/writes are not reads, and dynamic palette reads need runtime evidence.
 */
export function checkColorSource(file: string, source: string): ColorDiagnostic[] {
  if (file === colorOwner) {
    return [];
  }
  const diagnostics: ColorDiagnostic[] = [];
  const report: Reporter = (message, line = 1, column = 1) => {
    if (
      !diagnostics.some(
        (item) => item.line === line && item.column === column && item.message === message
      )
    ) {
      diagnostics.push({ column, file, line, message });
    }
  };
  try {
    if (file.endsWith(".css")) {
      inspectCss(source, report);
    } else {
      const input = file.endsWith(".svg") ? svgInput(source, report) : source;
      const root = asNode(
        parse(input, { plugins: ["typescript", "jsx"], sourceType: "unambiguous" })
      );
      if (!root) {
        throw new Error("Expected a parsed source file");
      }
      const all = nodesOf(root);
      const inspector = new PaintInspector(bindingsOf(all), report);
      for (const node of all) {
        inspector.visit(node);
      }
    }
  } catch (error) {
    report(
      `Color policy could not parse source: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  return diagnostics;
}
