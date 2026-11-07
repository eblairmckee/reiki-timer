import { DOMParser, type Element as XmlElement } from "@xmldom/xmldom";
import { colorsNamed, parse as parseColor } from "culori";
import postcss, { type Container, type Declaration, type Document } from "postcss";
import valueParser from "postcss-value-parser";
import ts from "typescript-parser";

export interface SourceFile {
  path: string;
  text: string;
}
export interface Diagnostic {
  column: number;
  line: number;
  message: string;
  path: string;
  rule: "tokens/noLiteralColor" | "tokens/unusedThemeToken" | "tokens/parse";
  severity: "error" | "warning";
}
export const themePath = "src/components/design-system/styles/theme.css";
const colorFunctions = new Set([
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "hwb",
  "lab",
  "lch",
  "oklab",
  "oklch",
  "color",
  "device-cmyk",
]);
const systemColors = new Set(
  "AccentColor AccentColorText ActiveText ButtonBorder ButtonFace ButtonText Canvas CanvasText Field FieldText GrayText Highlight HighlightText LinkText Mark MarkText SelectedItem SelectedItemText VisitedText"
    .toLowerCase()
    .split(" ")
);
const paintProperty =
  /(?:color|background|border|outline|shadow|fill|stroke|paint|stop|flood|lighting|gradient|caret|accent|decoration|mask)/iu;
const semanticProperty = /^(?:variant|name|id|className|class|key|href|src|to|type)$/u;
const numericChannel = /(?:^|[^a-z_-])(?:[+-]?(?:\d*\.)?\d)|#[\da-f]/iu;
const hexColor = /^#[\da-f]{3,8}$/iu;
const forcedActive = /\(\s*forced-colors\s*:\s*active\s*\)/iu;
const negativeQuery = /\b(?:not|or)\b/iu;
const semanticCall =
  /^(?:createElement|createElementNS|getContext|querySelector|querySelectorAll|getElementById)$/u;
const cssLikeString = /[()#]|^(?:inset\s|[+-]?(?:\d*\.)?\d)/u;
const scriptExtension = /\.tsx?$/u;
const testPath = /(?:^|\/)(?:test|tests|__tests__)(?:\/|\.)|\.(?:test|spec)\.[^.]+$/u;

function diagnostic(
  file: SourceFile,
  offset: number,
  rule: Diagnostic["rule"],
  message: string,
  severity: Diagnostic["severity"] = "error"
): Diagnostic {
  const before = file.text.slice(0, offset);
  const lines = before.split("\n");
  return {
    column: (lines.at(-1)?.length ?? 0) + 1,
    line: lines.length,
    message,
    path: file.path,
    rule,
    severity,
  };
}

/** Values are parsed, so comments, quoted labels and url(#fragment) never become paint. */
function literalColors(
  value: string,
  includeHex: boolean,
  forcedColors: boolean
): { offset: number; value: string }[] {
  const result: { offset: number; value: string }[] = [];
  valueParser(value).walk((node) => {
    if (node.type === "function") {
      const name = node.value.toLowerCase();
      if (name === "url") {
        return false;
      }
      if (colorFunctions.has(name) && numericChannel.test(valueParser.stringify(node.nodes))) {
        // Literal channels belong to the theme. Fully dynamic channel serialization
        // is allowed; color-mix is traversed to inspect each operand.
        result.push({ offset: node.sourceIndex, value: valueParser.stringify(node) });
        return false;
      }
    }
    if (node.type !== "word") {
      return;
    }
    const word = node.value.toLowerCase();
    if (literalWord(word, includeHex, forcedColors)) {
      result.push({ offset: node.sourceIndex, value: node.value });
    }
  });
  return result;
}

function literalWord(word: string, includeHex: boolean, forcedColors: boolean): boolean {
  if (word === "transparent" || word === "currentcolor") {
    return false;
  }
  if (systemColors.has(word)) {
    return !forcedColors;
  }
  if (hexColor.test(word)) {
    return includeHex && Boolean(parseColor(word));
  }
  return Object.hasOwn(colorsNamed, word);
}

function tokenReads(value: string): Set<string> {
  const result = new Set<string>();
  valueParser(value).walk((node) => {
    if (node.type === "function" && node.value.toLowerCase() === "url") {
      return false;
    }
    if (node.type === "function" && node.value.toLowerCase() === "var") {
      const name = node.nodes.find((part) => part.type === "word");
      if (name?.value.startsWith("--")) {
        result.add(name.value);
      }
    }
  });
  return result;
}

function inForcedColors(declaration: Declaration): boolean {
  // Every alternative must require active forced colors. A comma query containing
  // prefers-contrast also runs normally and does not authorize system paints.
  for (
    let parent: Container | Document | undefined = declaration.parent;
    parent;
    parent = parent.parent
  ) {
    if (parent instanceof postcss.AtRule && parent.name.toLowerCase() === "media") {
      const queries = valueParser(parent.params).nodes;
      const groups: string[][] = [[]];
      for (const node of queries) {
        if (node.type === "div" && node.value === ",") {
          groups.push([]);
        } else {
          groups.at(-1)?.push(valueParser.stringify(node));
        }
      }
      if (
        groups.every(
          (parts) => forcedActive.test(parts.join("")) && !negativeQuery.test(parts.join(""))
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

function propertyName(node: ts.Node): string | undefined {
  if (ts.isPropertyAssignment(node) || ts.isBindingElement(node) || ts.isJsxAttribute(node)) {
    return node.name.getText().replace(/^['"]|['"]$/gu, "");
  }
  return undefined;
}
function isTypeNode(node: ts.Node): boolean {
  for (let ancestor: ts.Node | undefined = node; ancestor; ancestor = ancestor.parent) {
    if (ts.isTypeNode(ancestor)) {
      return true;
    }
  }
  return false;
}
function semanticString(node: ts.Node): boolean {
  const { parent } = node;
  if (
    ts.isCallExpression(parent) &&
    ts.isPropertyAccessExpression(parent.expression) &&
    semanticCall.test(parent.expression.name.text)
  ) {
    return true;
  }
  const name = propertyName(parent);
  return Boolean(name && semanticProperty.test(name));
}
function isKey(node: ts.Node): boolean {
  return (
    (ts.isPropertyAssignment(node.parent) ||
      ts.isPropertyDeclaration(node.parent) ||
      ts.isMethodDeclaration(node.parent)) &&
    node.parent.name === node
  );
}
function staticStrings(node: ts.Node): string[] {
  const result: string[] = [];
  function visit(child: ts.Node) {
    if (ts.isStringLiteralLike(child)) {
      result.push(child.text);
    }
    ts.forEachChild(child, visit);
  }
  visit(node);
  return result;
}

function writtenToken(node: ts.Node): string | undefined {
  const { parent } = node;
  const property = propertyName(parent);
  if (property?.startsWith("--")) {
    return property;
  }
  if (
    !(ts.isCallExpression(parent) && ts.isPropertyAccessExpression(parent.expression)) ||
    parent.expression.name.text !== "setProperty" ||
    parent.arguments[1] !== node
  ) {
    return undefined;
  }
  const [key] = parent.arguments;
  return key && ts.isStringLiteralLike(key) && key.text.startsWith("--") ? key.text : undefined;
}

/** Typed material palettes may be single tuples or readonly collections. */
function isPaletteType(node: ts.TypeNode): boolean {
  if (ts.isTypeOperatorNode(node)) {
    return isPaletteType(node.type);
  }
  if (ts.isArrayTypeNode(node)) {
    return isPaletteType(node.elementType);
  }
  return ts.isTypeReferenceNode(node) && node.typeName.getText() === "AtmospherePalette";
}

/** Recognize the controlled material renderer's direct palette-token read. */
function isPaletteRead(argument: ts.Expression): boolean {
  if (!ts.isIdentifier(argument)) {
    return false;
  }
  for (let ancestor: ts.Node | undefined = argument.parent; ancestor; ancestor = ancestor.parent) {
    if (!ts.isArrowFunction(ancestor) || ancestor.parameters[0]?.name.getText() !== argument.text) {
      continue;
    }
    const call = ancestor.parent;
    if (
      ts.isCallExpression(call) &&
      ts.isPropertyAccessExpression(call.expression) &&
      call.expression.name.text === "map" &&
      call.expression.expression.getText() === "palette"
    ) {
      return true;
    }
  }
  return false;
}

function recordPropertyRead(
  node: ts.Node,
  file: SourceFile,
  roots: Set<string>,
  paletteNames: Set<string>
) {
  if (testPath.test(file.path)) {
    return;
  }
  if (
    !(ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) ||
    node.expression.name.text !== "getPropertyValue"
  ) {
    return;
  }
  const [argument] = node.arguments;
  if (!argument) {
    return;
  }
  if (ts.isStringLiteralLike(argument) && argument.text.startsWith("--")) {
    roots.add(argument.text);
  }
  if (isPaletteRead(argument)) {
    for (const name of paletteNames) {
      roots.add(name);
    }
  }
}

export function analyzeTokens(files: SourceFile[]): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const roots = new Set<string>();
  const dependencies = new Map<string, Set<string>>();
  const declarations = new Map<string, Diagnostic[]>();
  const sources = files.filter((file) => !file.path.endsWith(".gen.ts"));
  const parsedScripts = sources
    .filter((file) => scriptExtension.test(file.path))
    .map((file) => ({
      ast: ts.createSourceFile(
        file.path,
        file.text,
        ts.ScriptTarget.Latest,
        true,
        file.path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
      ),
      file,
    }));
  const paletteNames = new Set<string>();
  for (const { ast, file } of parsedScripts) {
    if (testPath.test(file.path)) {
      continue;
    }
    function palette(node: ts.Node) {
      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.initializer &&
        ts.isSatisfiesExpression(node.initializer) &&
        isPaletteType(node.initializer.type)
      ) {
        for (const value of staticStrings(node.initializer)) {
          if (value.startsWith("--")) {
            paletteNames.add(value);
          }
        }
      }
      ts.forEachChild(node, palette);
    }
    palette(ast);
  }
  function read(file: SourceFile, value: string, writeTo?: string) {
    if (testPath.test(file.path)) {
      return;
    }
    const target = writeTo ? (dependencies.get(writeTo) ?? new Set<string>()) : roots;
    for (const name of tokenReads(value)) {
      target.add(name);
    }
    if (writeTo) {
      dependencies.set(writeTo, target);
    }
  }
  function colors(
    file: SourceFile,
    value: string,
    offset: number,
    includeHex: boolean,
    forced: boolean
  ) {
    for (const literal of literalColors(value, includeHex, forced)) {
      diagnostics.push(
        diagnostic(
          file,
          offset + literal.offset,
          "tokens/noLiteralColor",
          `Use a theme variable instead of ${literal.value}.`
        )
      );
    }
  }
  function trackDeclaration(
    file: SourceFile,
    declaration: Declaration,
    reads: Set<string>,
    base: number
  ) {
    if (testPath.test(file.path)) {
      return;
    }
    if (declaration.prop.startsWith("--")) {
      const known = dependencies.get(declaration.prop) ?? new Set<string>();
      for (const name of reads) {
        known.add(name);
      }
      dependencies.set(declaration.prop, known);
      if (file.path === themePath) {
        const locations = declarations.get(declaration.prop) ?? [];
        locations.push(
          diagnostic(
            file,
            base + (declaration.source?.start?.offset ?? 0),
            "tokens/unusedThemeToken",
            `${declaration.prop} has no production read.`,
            "warning"
          )
        );
        declarations.set(declaration.prop, locations);
      }
    } else {
      for (const name of reads) {
        roots.add(name);
      }
    }
  }
  function css(file: SourceFile, text = file.text, base = 0, includeHex = false) {
    try {
      postcss.parse(text, { from: file.path }).walkDecls((declaration) => {
        const valueOffset =
          base +
          (declaration.source?.start?.offset ?? 0) +
          declaration.prop.length +
          (declaration.raws.between?.length ?? 1);
        const reads = tokenReads(declaration.value);
        trackDeclaration(file, declaration, reads, base);
        if (
          file.path !== themePath &&
          (paintProperty.test(declaration.prop) || declaration.prop.startsWith("--"))
        ) {
          colors(file, declaration.value, valueOffset, includeHex, inForcedColors(declaration));
        }
      });
    } catch (error) {
      diagnostics.push(diagnostic(file, base, "tokens/parse", String(error)));
    }
  }
  function svgAttributes(file: SourceFile, element: XmlElement) {
    for (let attrIndex = 0; attrIndex < element.attributes.length; attrIndex += 1) {
      const attribute = element.attributes.item(attrIndex);
      if (!attribute) {
        continue;
      }
      // xmldom locations identify the parsed attribute without searching raw source.
      const line = attribute.lineNumber ?? element.lineNumber ?? 1;
      const column = attribute.columnNumber ?? element.columnNumber ?? 1;
      const offset =
        file.text
          .split("\n")
          .slice(0, line - 1)
          .reduce((sum, part) => sum + part.length + 1, 0) +
        column -
        1;
      if (attribute.name === "style") {
        css(file, `x{${attribute.value}}`, offset, true);
      } else if (paintProperty.test(attribute.name)) {
        colors(file, attribute.value, offset, true, false);
        read(file, attribute.value);
      }
    }
  }
  function svg(file: SourceFile) {
    try {
      const document = new DOMParser({
        locator: true,
        onError: (level, message) => {
          if (level !== "warning") {
            throw new Error(message);
          }
        },
      }).parseFromString(file.text, "image/svg+xml");
      // biome-ignore lint/style/useDomQuerySelector: xmldom implements XML DOM traversal, not querySelectorAll.
      const elements = document.getElementsByTagName("*");
      for (let index = 0; index < elements.length; index += 1) {
        const element = elements.item(index);
        if (!element) {
          continue;
        }
        svgAttributes(file, element);
        if (element.localName === "style") {
          css(file, element.textContent ?? "", 0, true);
        }
      }
    } catch (error) {
      diagnostics.push(diagnostic(file, 0, "tokens/parse", String(error)));
    }
  }
  for (const file of sources) {
    if (file.path.endsWith(".css")) {
      css(file);
    }
    if (file.path.endsWith(".svg")) {
      svg(file);
    }
  }
  for (const { file, ast } of parsedScripts) {
    const syntax = ts.transpileModule(file.text, {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ESNext },
      fileName: file.path,
      reportDiagnostics: true,
    });
    for (const issue of syntax.diagnostics ?? []) {
      if (issue.category === ts.DiagnosticCategory.Error) {
        diagnostics.push(
          diagnostic(
            file,
            issue.start ?? 0,
            "tokens/parse",
            ts.flattenDiagnosticMessageText(issue.messageText, " ")
          )
        );
      }
    }
    function visit(node: ts.Node) {
      recordPropertyRead(node, file, roots, paletteNames);
      if (isTypeNode(node)) {
        return;
      }
      if ((ts.isStringLiteralLike(node) || ts.isTemplateExpression(node)) && !isKey(node)) {
        const value = ts.isTemplateExpression(node)
          ? [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join(
              "__expression__"
            )
          : node.text;
        const paintContext = paintProperty.test(propertyName(node.parent) ?? "");
        const wholeColor = literalWord(value.toLowerCase().trim(), true, false);
        if (!semanticString(node) && (paintContext || wholeColor || cssLikeString.test(value))) {
          colors(file, value, node.getStart(ast) + 1, true, false);
        }
        // Static custom-property assignments declare aliases. Their dependencies
        // become live only when the assigned token has a production read.
        read(file, value, writtenToken(node));
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
  const used = new Set<string>();
  function follow(name: string) {
    if (used.has(name)) {
      return;
    }
    used.add(name);
    for (const dependency of dependencies.get(name) ?? []) {
      follow(dependency);
    }
  }
  for (const name of roots) {
    follow(name);
  }
  for (const [name, locations] of declarations) {
    if (!used.has(name)) {
      diagnostics.push(...locations);
    }
  }
  return diagnostics;
}
