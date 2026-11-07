import { posix } from "node:path";
import parseValue from "postcss-value-parser";
import ts from "typescript-parser";
import { checkMotionOptions } from "./design-motion-options";

const systemDirectory = "src/components/design-system/";
const camelBoundary = /(?<previous>[a-z\d])(?<next>[A-Z])/gu;
const acronymBoundary = /(?<previous>[A-Z])(?<next>[A-Z][a-z])/gu;
const domainWord =
  /(?:^|[^a-z0-9])(?:timers?|chakras?|reiki|chimes?|count-?down|cool-?down|warm-?up|gassho|hud|time-picker)(?=$|[^a-z0-9])/u;
const testModule = /\.(?:test|spec)\.tsx?$/u;
const queryOrFragment = /[?#].*$/u;

export function isSystemSource(path: string): boolean {
  return path.startsWith(systemDirectory);
}

export function usesProductName(name: string): boolean {
  return domainWord.test(
    name
      .replace(acronymBoundary, "$<previous>-$<next>")
      .replace(camelBoundary, "$<previous>-$<next>")
      .toLowerCase()
  );
}

/** The @ alias is shared by tsconfig and Vite. External package specifiers stay external. */
export function leavesDesignSystem(from: string, specifier: string): boolean {
  const local = specifier.replace(queryOrFragment, "");
  if (local.startsWith("@/")) {
    return !isSystemSource(posix.join("src", local.slice(2)));
  }
  if (local.startsWith("/src/")) {
    return !isSystemSource(posix.normalize(local.slice(1)));
  }
  return local.startsWith(".") && !isSystemSource(posix.join(posix.dirname(from), local));
}

/** @import accepts either a quoted URL or url(...) before optional layer/media qualifiers. */
export function cssImportPath(params: string): string | undefined {
  const first = parseValue(params).nodes.find(
    (node) => node.type !== "comment" && node.type !== "space"
  );
  if (first?.type === "string") {
    return first.value;
  }
  if (first?.type === "function" && first.value.toLowerCase() === "url") {
    return first.nodes.find((node) => node.type === "word" || node.type === "string")?.value;
  }
  return undefined;
}

type Report = (node: ts.Node, rule: string, message: string) => void;

function importLiteral(node: ts.StringLiteralLike): boolean {
  const { parent } = node;
  if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) {
    return parent.moduleSpecifier === node;
  }
  return (
    ts.isExternalModuleReference(parent) ||
    (ts.isLiteralTypeNode(parent) && ts.isImportTypeNode(parent.parent)) ||
    (ts.isCallExpression(parent) &&
      parent.arguments[0] === node &&
      (parent.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(parent.expression) && parent.expression.text === "require")))
  );
}

function isStyleHook(name: string): boolean {
  return name === "className" || name === "id" || name.startsWith("data-");
}

function checkStyleHook(node: ts.JsxAttribute, report: Report) {
  const hook = node.name.getText();
  if (!isStyleHook(hook)) {
    return;
  }
  const value =
    node.initializer && ts.isStringLiteral(node.initializer) ? node.initializer.text : "";
  if (usesProductName(hook) || usesProductName(value)) {
    report(node, "contracts/systemName", `Name ${hook} for the shared visual or interaction role.`);
  }
}

export function checkSystemModule(
  path: string,
  source: ts.SourceFile,
  checker: ts.TypeChecker,
  report: Report
) {
  const module = checker.getSymbolAtLocation(source);
  for (const symbol of module ? checker.getExportsOfModule(module) : []) {
    if (usesProductName(symbol.name)) {
      report(
        symbol.declarations?.[0] ?? source,
        "contracts/systemName",
        `${symbol.name}: name the shared role, or keep this domain concept in the app or feature that owns it.`
      );
    }
  }
  const production = !testModule.test(path);
  function visit(node: ts.Node) {
    if (production) {
      checkMotionOptions(node, checker, report);
    }
    if (ts.isJsxAttribute(node)) {
      checkStyleHook(node, report);
    }
    if (ts.isStringLiteralLike(node)) {
      if (importLiteral(node) && leavesDesignSystem(path, node.text)) {
        report(
          node,
          "contracts/systemImport",
          `Keep ${node.text} outside the design-system module. Supply feature data or actions from the caller.`
        );
      } else if (ts.isLiteralTypeNode(node.parent) && usesProductName(node.text)) {
        report(
          node,
          "contracts/systemName",
          `${node.text}: name this variant for its appearance or behavior across features.`
        );
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
