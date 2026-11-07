import ts from "typescript-parser";

const timingFields = new Set(["duration", "delay", "ease", "stiffness", "damping", "mass"]);
type Report = (node: ts.Node, rule: string, message: string) => void;

function motionImport(node: ts.Expression, checker: ts.TypeChecker, name: string): boolean {
  const binding = ts.isPropertyAccessExpression(node) ? node.expression : node;
  const declaration = checker.getSymbolAtLocation(binding)?.declarations?.[0];
  if (!(declaration && (ts.isImportSpecifier(declaration) || ts.isNamespaceImport(declaration)))) {
    return false;
  }
  const owner = ts.findAncestor(declaration, ts.isImportDeclaration);
  if (!(owner && ts.isStringLiteral(owner.moduleSpecifier))) {
    return false;
  }
  if (!["motion", "motion/react"].includes(owner.moduleSpecifier.text)) {
    return false;
  }
  return ts.isImportSpecifier(declaration)
    ? ts.isIdentifier(node) && (declaration.propertyName ?? declaration.name).text === name
    : ts.isPropertyAccessExpression(node) && node.name.text === name;
}

function motionOptions(node: ts.Node, checker: ts.TypeChecker) {
  if (ts.isCallExpression(node) && motionImport(node.expression, checker, "animate")) {
    const [subject, sequenceOptions, animationOptions] = node.arguments;
    return (
      animationOptions ??
      (subject && ts.isArrayLiteralExpression(subject) ? sequenceOptions : undefined)
    );
  }
  if (
    ts.isJsxAttribute(node) &&
    node.name.getText() === "transition" &&
    node.initializer &&
    ts.isJsxExpression(node.initializer)
  ) {
    const tag = node.parent.parent.tagName;
    if (ts.isPropertyAccessExpression(tag) && motionImport(tag.expression, checker, "motion")) {
      return node.initializer.expression;
    }
  }
}

function fixedTiming(value: ts.Expression, field: string): boolean {
  const literal = ts.isPrefixUnaryExpression(value) ? value.operand : value;
  if (ts.isNumericLiteral(literal)) {
    return Number(literal.text) !== 0 || (field !== "duration" && field !== "delay");
  }
  if (ts.isArrayLiteralExpression(value) && field === "ease") {
    return value.elements.length > 0 && value.elements.every((item) => fixedTiming(item, field));
  }
  return ts.isStringLiteralLike(value);
}

function localInitializer(id: ts.Identifier, checker: ts.TypeChecker) {
  const symbol = ts.isShorthandPropertyAssignment(id.parent)
    ? checker.getShorthandAssignmentValueSymbol(id.parent)
    : checker.getSymbolAtLocation(id);
  const local = symbol?.valueDeclaration;
  return local && local.getSourceFile() === id.getSourceFile() && ts.isVariableDeclaration(local)
    ? local.initializer
    : undefined;
}

/** Inspect options at actual Motion calls and JSX props. Follow local constants and
 * branches, leaving runtime values and imported profiles to their owners. */
export function checkMotionOptions(node: ts.Node, checker: ts.TypeChecker, report: Report) {
  const options = motionOptions(node, checker);
  if (!options) {
    return;
  }
  const visited = new Map<string, Set<ts.Expression>>();
  function inspect(value: ts.Expression | undefined, field = "") {
    const seen = visited.get(field) ?? new Set<ts.Expression>();
    if (!value || seen.has(value)) {
      return;
    }
    seen.add(value);
    visited.set(field, seen);
    if (timingFields.has(field) && fixedTiming(value, field)) {
      report(
        value,
        "contracts/motionProfile",
        `${field}: use a transition from shared/motion.ts for fixed animation timing. Runtime values and immediate reduced motion are supported.`
      );
    } else if (ts.isIdentifier(value)) {
      inspect(localInitializer(value, checker), field);
    } else if (ts.isConditionalExpression(value)) {
      inspect(value.whenTrue, field);
      inspect(value.whenFalse, field);
    } else if (
      ts.isParenthesizedExpression(value) ||
      ts.isAsExpression(value) ||
      ts.isSatisfiesExpression(value)
    ) {
      inspect(value.expression, field);
    } else if (ts.isObjectLiteralExpression(value)) {
      value.properties.forEach(inspectProperty);
    }
  }
  function inspectProperty(item: ts.ObjectLiteralElementLike) {
    if (ts.isSpreadAssignment(item)) {
      inspect(item.expression);
    } else if (ts.isShorthandPropertyAssignment(item)) {
      inspect(item.name, item.name.text);
    } else if (
      ts.isPropertyAssignment(item) &&
      (ts.isIdentifier(item.name) || ts.isStringLiteral(item.name))
    ) {
      inspect(item.initializer, item.name.text);
    }
  }
  inspect(options);
}
