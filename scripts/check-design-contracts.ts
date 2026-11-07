import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { type Selector, type SelectorComponent, transform } from "lightningcss";
import postcss, { type Declaration } from "postcss";
import ts from "typescript-parser";
import { hasLiteralMotion, hasRawBackdropBlur } from "./design-css-values";
import {
  checkSystemModule,
  cssImportPath,
  isSystemSource,
  leavesDesignSystem,
  usesProductName,
} from "./design-system-boundary";

/** Mechanical contract checks; prose quality and usefulness still require human review. */
export interface ContractDiagnostic {
  column: number;
  line: number;
  message: string;
  path: string;
  rule: string;
}
export interface ContractSource {
  path: string;
  text: string;
}
const componentPath =
  /src\/components\/(?<layer>design-system|atoms|molecules)\/(?<family>[^/]+)\/(?:index\.ts|(?:[^/]+\/)*[^/]+\.tsx)$/u;
const testModule = /\.(?:test|spec)\.tsx?$/u;
const genericNames =
  /^(?:Root|Trigger|View|Content|Item|Component|Widget|Thing|Stuff|Foo|Bar|Test|Example|Helper|Part|Wrapper|Container)$/u;
const ambiguousProps = /^(?:thing|stuff|primary|secondary|foo|bar)$/u;
const phaseNames = new Set([
  "enter",
  "exit",
  "appear",
  "disappear",
  "open",
  "close",
  "expand",
  "collapse",
  "press",
  "release",
  "feedback",
  "hover",
  "rest",
  "focus",
  "blur",
  "slide",
  "reveal",
  "hide",
  "settle",
  "blackout",
]);
const normalize = (path: string) => path.replaceAll("\\", "/");
const pascalCase = (name: string) =>
  name
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join("");

const patterns = {
  callbackFireDocs:
    /\b(?:fires?|called|calls?|invoked|runs?|notifies|receives|request|change|release|activation)\b/iu,
  callbackName: /^on[A-Z]/u,
  callbackRepeatDocs: /\b(?:each|every|repeat\w*|once|again)\b/iu,
  callbackTriggerDocs: /\b(?:when|whenever|after|before|on|every|each)\b/iu,
  compatibilityFile: /src\/components\/design-system\/styles\/olyx-compat\.css$/u,
  genericInteraction: /^(?:thing|stuff|default|timings|values)$/u,
  interactionName: /^[a-z][a-zA-Z0-9]*$/u,
  lowerCamelCase: /^[a-z][a-zA-Z0-9]*$/u,
  lowercaseLetter: /[a-z]/u,
  motionFile: /src\/components\/design-system\/shared\/motion\.ts$/u,
  pascalCase: /^[A-Z][a-zA-Z0-9]*$/u,
  pascalCaseStart: /^[A-Z]/u,
  placeholderPurpose: /(?:^|-)(?:thing|stuff|foo|bar|misc)(?:-|$)/u,
  platformPassthrough:
    /^(?:id|ref|key|className|style|title|role|tabIndex|aria-[a-z-]+|data-[a-z-]+|on[A-Z][a-zA-Z]+)$/u,
  reactContent: /React(?:Node|Element)|\bElement\b/u,
  reactDeclarations: /node_modules\/@types\/react\/index\.d\.ts$/u,
  referenceScale: /^--ref-(?:space|font|radius|shadow|motion)-[0-9]+(?:-[a-z0-9]+)*$/u,
  repeatableCallback: /preview|press|repeat|activat/iu,
  scopedAliasValue: /^var\(--(?:ref|sys|cmp)-[a-z0-9-]+\)$/u,
  scopedPrefix: /^--(?:ref|sys|cmp)-/u,
  scopedToken:
    /^--(?:ref|sys|cmp)-(?:align|color|filter|font|motion|opacity|radius|ratio|shadow|size|space)-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u,
  scriptExtension: /\.tsx?$/u,
  slotContentDocs:
    /\b(?:text|elements?|nodes?|icons?|buttons?|links?|content|children|controls?|actions?|summary)\b/iu,
  slotInteractionDocs:
    /\b(?:interactive|noninteractive|non-interactive|interaction|focusable|passive|decorative|buttons?|links?|controls?)\b/iu,
  slotNamingDocs: /\b(?:accessib\w*|aria-[a-z-]+|label\w*|nam(?:e|es|ing|ed))\b/iu,
  sourceExtension: /\.(?:tsx?|css)$/u,
  themeFile:
    /src\/components\/design-system\/styles\/(?:theme[^/]*|olyx-compat|upstream-compatibility)\.css$/u,
  upstreamAlias:
    /^--(?:color|radius|font|shadow|spacing|ease|duration|transition)-[a-z0-9]+(?:-[a-z0-9]+)*$/u,
  vacuousDocs:
    /^(?:the )?(?:prop(?:erty)?|value|content|configuration|option|callback|slot)(?: for .*)?\.?$/iu,
  vacuousVerbDocs: /^(?:sets?|gets?) (?:the )?\w+\.?$/iu,
  words: /[a-zA-Z]+/gu,
};

function createContractProgram(input: Map<string, string>, root: string): ts.Program {
  const configPath = ts.findConfigFile(root, ts.sys.fileExists);
  const config = configPath ? ts.readConfigFile(configPath, ts.sys.readFile) : { config: {} };
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  const options: ts.CompilerOptions = {
    ...parsed.options,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    skipLibCheck: true,
    strict: true,
  };
  const host = ts.createCompilerHost(options);
  const originalRead = host.readFile.bind(host);
  const originalExists = host.fileExists.bind(host);
  host.readFile = (path) => input.get(normalize(resolve(path))) ?? originalRead(path);
  host.fileExists = (path) => input.has(normalize(resolve(path))) || originalExists(path);
  // In-memory fixture directories must participate in module resolution as real directories do.
  const originalDirectoryExists = host.directoryExists?.bind(host);
  host.directoryExists = (path) =>
    [...input.keys()].some((key) => key.startsWith(`${normalize(resolve(path))}/`)) ||
    Boolean(originalDirectoryExists?.(path));
  const program = ts.createProgram(
    [...input.keys()].filter((path) => patterns.scriptExtension.test(path)),
    options,
    host
  );
  return program;
}

type Report = (node: ts.Node, rule: string, message: string) => void;
function hasFlag(symbol: ts.Symbol, flag: ts.SymbolFlags): boolean {
  // biome-ignore lint/suspicious/noBitwiseOperators: Compiler symbol kinds are bit flags.
  return Boolean(symbol.flags & flag);
}
function jsxResult(type: ts.Type, visited = new Set<ts.Type>()): boolean {
  if (visited.has(type)) {
    return false;
  }
  visited.add(type);
  if (type.isUnionOrIntersection()) {
    return type.types.some((part) => jsxResult(part, visited));
  }
  return Boolean(type.getProperty("type") && type.getProperty("key") && type.getProperty("props"));
}
function ownedProperty(node: ts.Node): boolean {
  return (
    ts.isPropertySignature(node) ||
    ts.isPropertyDeclaration(node) ||
    ts.isParameter(node) ||
    ts.isBindingElement(node) ||
    ts.isPropertyAssignment(node) ||
    ts.isMethodSignature(node)
  );
}
function ownedByFamily(name: string, owner: string): boolean {
  if (name === owner) {
    return true;
  }
  const suffix = name.slice(owner.length);
  return name.startsWith(owner) && patterns.pascalCaseStart.test(suffix);
}

/** Only local transport declarations with the same types as real React intrinsic props pass through. */
class PlatformContracts {
  private readonly checker: ts.TypeChecker;
  private readonly contracts: ts.Type[] = [];
  private readonly byName = new Map<string, ts.Type[]>();
  constructor(checker: ts.TypeChecker, program: ts.Program) {
    this.checker = checker;
    const visit = (node: ts.Node) => {
      if (ts.isInterfaceDeclaration(node) && node.name.text === "IntrinsicElements") {
        const intrinsic = checker.getTypeAtLocation(node);
        for (const element of intrinsic.getProperties()) {
          this.contracts.push(checker.getTypeOfSymbolAtLocation(element, node));
        }
      }
      ts.forEachChild(node, visit);
    };
    for (const source of program.getSourceFiles()) {
      if (patterns.reactDeclarations.test(normalize(source.fileName))) {
        visit(source);
      }
    }
  }
  private candidates(name: string, node: ts.Node): ts.Type[] {
    const cached = this.byName.get(name);
    if (cached) {
      return cached;
    }
    const candidates: ts.Type[] = [];
    for (const contract of this.contracts) {
      const prop = contract.getProperty(name);
      if (prop) {
        candidates.push(this.checker.getTypeOfSymbolAtLocation(prop, node));
      }
    }
    this.byName.set(name, candidates);
    return candidates;
  }
  matches(name: string, type: ts.Type, node: ts.Node): boolean {
    if (!patterns.platformPassthrough.test(name)) {
      return false;
    }
    const local = this.checker.getNonNullableType(type);
    return this.candidates(name, node).some((candidate) => {
      const native = this.checker.getNonNullableType(candidate);
      return (
        this.checker.isTypeAssignableTo(local, native) &&
        this.checker.isTypeAssignableTo(native, local)
      );
    });
  }
}

class PublicProps {
  private readonly checker: ts.TypeChecker;
  private readonly root: string;
  private readonly report: Report;
  private readonly platform: PlatformContracts;
  constructor(checker: ts.TypeChecker, program: ts.Program, root: string, report: Report) {
    this.checker = checker;
    this.root = root;
    this.report = report;
    this.platform = new PlatformContracts(checker, program);
  }
  private local(node: ts.Node): boolean {
    const path = normalize(node.getSourceFile().fileName);
    return (
      path.startsWith(`${normalize(resolve(this.root))}/src/`) && !path.includes("/node_modules/")
    );
  }
  private isSlot(type: ts.Type): boolean {
    return (
      patterns.reactContent.test(this.checker.typeToString(type)) ||
      type.aliasSymbol?.name === "ReactNode" ||
      jsxResult(type)
    );
  }
  private checkName(name: string, label: string, component: string, node: ts.Node) {
    if (
      isSystemSource(normalize(relative(this.root, node.getSourceFile().fileName))) &&
      usesProductName(name)
    ) {
      this.report(
        node,
        "contracts/systemName",
        `${label}: name this public prop for the control's purpose across features.`
      );
    }
    if (
      !patterns.lowerCamelCase.test(name) ||
      ambiguousProps.test(name) ||
      (ownedByFamily(component, "Button") && name === "mode")
    ) {
      this.report(
        node,
        "contracts/propName",
        `${label}: use a purposeful lowerCamelCase name (for example primaryAction, appearance or intent).`
      );
    }
  }
  private checkDescription(doc: string, label: string, node: ts.Node) {
    const words = doc.match(patterns.words) ?? [];
    if (words.length < 4 || patterns.vacuousDocs.test(doc) || patterns.vacuousVerbDocs.test(doc)) {
      this.report(
        node,
        "contracts/propDocs",
        `${label}: add relevant JSDoc explaining the caller's choice or responsibility.`
      );
    }
  }
  private checkSlot(doc: string, label: string, node: ts.Node) {
    if (
      !(
        patterns.slotContentDocs.test(doc) &&
        patterns.slotInteractionDocs.test(doc) &&
        patterns.slotNamingDocs.test(doc)
      )
    ) {
      this.report(
        node,
        "contracts/slotDocs",
        `${label}: describe accepted content, whether it is interactive, and who supplies its accessible name.`
      );
    }
  }
  private checkCallback(name: string, doc: string, label: string, node: ts.Node) {
    if (!patterns.callbackName.test(name)) {
      return;
    }
    if (!(patterns.callbackTriggerDocs.test(doc) && patterns.callbackFireDocs.test(doc))) {
      this.report(node, "contracts/callbackDocs", `${label}: document when the callback fires.`);
    }
    if (patterns.repeatableCallback.test(name) && !patterns.callbackRepeatDocs.test(doc)) {
      this.report(
        node,
        "contracts/callbackRepeat",
        `${label}: explain repeated invocation or why it fires only once.`
      );
    }
  }
  private checkProperty(prop: ts.Symbol, component: string, prefix: string, visited: Set<ts.Type>) {
    const declaration = prop.declarations?.find((node) => this.local(node));
    if (!(declaration && ownedProperty(declaration))) {
      return;
    }
    const { name } = prop;
    const type = this.checker.getTypeOfSymbolAtLocation(prop, declaration);
    if (this.platform.matches(name, type, declaration)) {
      return;
    }
    const label = `${component}.${prefix}${name}`;
    const doc = ts.displayPartsToString(prop.getDocumentationComment(this.checker)).trim();
    this.checkName(name, label, component, declaration);
    this.checkDescription(doc, label, declaration);
    const slot = this.isSlot(type);
    const callable =
      this.checker.getSignaturesOfType(this.checker.getNonNullableType(type), ts.SignatureKind.Call)
        .length > 0;
    if (slot) {
      this.checkSlot(doc, label, declaration);
    }
    if (callable) {
      this.checkCallback(name, doc, label, declaration);
    }
    if (!(slot || callable || type.getProperty("then")) && prefix.split(".").length < 9) {
      this.inspect(type, component, `${prefix}${name}.`, visited);
    }
  }
  inspect(type: ts.Type, component: string, prefix = "", visited = new Set<ts.Type>()) {
    if (visited.has(type)) {
      return;
    }
    const next = new Set(visited).add(type);
    if (type.isUnionOrIntersection()) {
      for (const part of type.types) {
        this.inspect(part, component, prefix, next);
      }
      return;
    }
    const itemType = this.checker.getIndexTypeOfType(type, ts.IndexKind.Number);
    if (itemType) {
      this.inspect(itemType, component, `${prefix}item.`, next);
    }
    for (const prop of type.getProperties()) {
      this.checkProperty(prop, component, prefix, next);
    }
  }
}

class PublicExports {
  private readonly checker: ts.TypeChecker;
  private readonly report: Report;
  private readonly props: PublicProps;
  private readonly inspectedProps = new Set<ts.Symbol>();
  constructor(checker: ts.TypeChecker, program: ts.Program, root: string, report: Report) {
    this.checker = checker;
    this.report = report;
    this.props = new PublicProps(checker, program, root, report);
  }
  private checkName(name: string, owner: string, designSystem: boolean, node: ts.Node) {
    if (
      !(patterns.pascalCase.test(name) && patterns.lowercaseLetter.test(name)) ||
      genericNames.test(name) ||
      (designSystem && !ownedByFamily(name, owner))
    ) {
      this.report(
        node,
        "contracts/componentName",
        `${name}: use a purposeful PascalCase JSX name${designSystem ? ` beginning with ${owner} followed by a PascalCase part` : " (avoid generic Root, Trigger, View or placeholder names)"}.`
      );
    }
  }
  private inspectExport(
    exported: ts.Symbol,
    source: ts.SourceFile,
    owner: string,
    designSystem: boolean
  ) {
    const symbol = hasFlag(exported, ts.SymbolFlags.Alias)
      ? this.checker.getAliasedSymbol(exported)
      : exported;
    const exportNode =
      exported.declarations?.find((node) => node.getSourceFile() === source) ?? source;
    if (!symbol.declarations?.length && hasFlag(exported, ts.SymbolFlags.Alias)) {
      this.report(
        exportNode,
        "contracts/unresolvedExport",
        `${exported.name}: cannot resolve the public export; check its module path.`
      );
      return;
    }
    if (!hasFlag(symbol, ts.SymbolFlags.Value)) {
      return;
    }
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
    if (!declaration) {
      return;
    }
    const signatures = this.checker.getSignaturesOfType(
      this.checker.getTypeOfSymbolAtLocation(symbol, declaration),
      ts.SignatureKind.Call
    );
    if (!signatures.length) {
      return;
    }
    const jsx = signatures.some((signature) =>
      jsxResult(this.checker.getReturnTypeOfSignature(signature))
    );
    const { name } = exported;
    if (!(jsx || patterns.pascalCaseStart.test(name))) {
      return;
    }
    if (!jsx) {
      this.report(
        exportNode,
        "contracts/jsxExport",
        `${name}: PascalCase public component exports must return JSX; export ordinary helpers in lowerCamelCase.`
      );
      return;
    }
    this.checkName(name, owner, designSystem, exportNode);
    // Aliases need their own names checked, while their underlying props are shared.
    if (this.inspectedProps.has(symbol)) {
      return;
    }
    this.inspectedProps.add(symbol);
    for (const signature of signatures) {
      const [props] = signature.parameters;
      if (props) {
        this.props.inspect(this.checker.getTypeOfSymbolAtLocation(props, declaration), name);
      }
    }
  }
  inspect(source: ts.SourceFile, family: RegExpExecArray) {
    for (const statement of source.statements) {
      if (
        ts.isExportDeclaration(statement) &&
        !statement.exportClause &&
        statement.moduleSpecifier &&
        !this.checker.getSymbolAtLocation(statement.moduleSpecifier)
      ) {
        this.report(
          statement,
          "contracts/unresolvedExport",
          "Cannot resolve this star export; check its module path."
        );
      }
    }
    const module = this.checker.getSymbolAtLocation(source);
    const owner = pascalCase(family.groups?.family ?? "");
    // Shared motion helpers have no component family. Their JSX names and props
    // still go through the same checks as other components.
    const familyOwned = family.groups?.layer === "design-system" && owner !== "Shared";
    for (const exported of module ? this.checker.getExportsOfModule(module) : []) {
      this.inspectExport(exported, source, owner, familyOwned);
    }
  }
}

function checkMotion(source: ts.SourceFile, checker: ts.TypeChecker, report: Report) {
  const module = checker.getSymbolAtLocation(source);
  for (const symbol of module ? checker.getExportsOfModule(module) : []) {
    const { valueDeclaration: declaration } = symbol;
    if (!(declaration && ts.isVariableDeclaration(declaration))) {
      continue;
    }
    if (symbol.name !== "motion") {
      report(
        declaration,
        "contracts/motionGroup",
        `${symbol.name}: export the motion catalog grouped by interaction and phase, for example motion.disclosure.enter.`
      );
      continue;
    }
    const groups = checker.getTypeOfSymbolAtLocation(symbol, declaration).getProperties();
    if (!groups.length) {
      report(
        declaration,
        "contracts/motionGroup",
        "motion: provide at least one interaction group."
      );
    }
    for (const group of groups) {
      checkMotionGroup(group, declaration, checker, report);
    }
  }
}
function checkMotionGroup(
  group: ts.Symbol,
  node: ts.Node,
  checker: ts.TypeChecker,
  report: Report
) {
  if (!patterns.interactionName.test(group.name) || patterns.genericInteraction.test(group.name)) {
    report(
      node,
      "contracts/motionGroup",
      `${group.name}: use a purposeful lowerCamelCase interaction name.`
    );
  }
  const phases = checker.getTypeOfSymbolAtLocation(group, node).getProperties();
  if (!phases.length || phases.some((phase) => !phaseNames.has(phase.name))) {
    report(
      node,
      "contracts/motionPhase",
      `motion.${group.name}: use interaction phase keys such as enter/exit or press/release, not loose duration/easing fields.`
    );
  }
}
function checkStyleProfile(declaration: Declaration, path: string): ContractDiagnostic[] {
  let rule: string;
  let message: string;
  if (hasLiteralMotion(declaration.prop, declaration.value)) {
    rule = "contracts/motionProfile";
    message = `${declaration.prop}: use a named --sys-motion-* or --cmp-motion-* profile for nonzero timing and easing, including fallbacks.`;
  } else if (hasRawBackdropBlur(declaration.prop, declaration.value)) {
    rule = "contracts/materialProfile";
    message = `${declaration.prop}: use a named theme material or local --cmp-filter-* profile instead of a raw nonzero blur, including fallbacks.`;
  } else {
    return [];
  }
  return [
    {
      column: declaration.source?.start?.column ?? 1,
      line: declaration.source?.start?.line ?? 1,
      message,
      path,
      rule,
    },
  ];
}

function checkTokenNames({ path, text }: ContractSource): ContractDiagnostic[] {
  if (!path.endsWith(".css")) {
    return [];
  }
  const theme = patterns.themeFile.test(normalize(path));
  const system = isSystemSource(normalize(path));
  const diagnostics: ContractDiagnostic[] = [];
  try {
    const sheet = postcss.parse(text, { from: path });
    if (system) {
      sheet.walkDecls((declaration) => {
        diagnostics.push(...checkStyleProfile(declaration, path));
      });
      sheet.walkAtRules("import", (rule) => {
        const target = cssImportPath(rule.params);
        if (target && leavesDesignSystem(path, target)) {
          diagnostics.push({
            column: rule.source?.start?.column ?? 1,
            line: rule.source?.start?.line ?? 1,
            message: `System styles cannot depend on ${target}. Import shared styling from the system itself.`,
            path,
            rule: "contracts/systemImport",
          });
        }
      });
    }
    sheet.walkDecls((declaration) => {
      if (system && declaration.prop.startsWith("--") && usesProductName(declaration.prop)) {
        diagnostics.push({
          column: declaration.source?.start?.column ?? 1,
          line: declaration.source?.start?.line ?? 1,
          message: `${declaration.prop}: name the shared styling role, or keep this domain token with its app or feature owner.`,
          path,
          rule: "contracts/systemName",
        });
      }
      if (
        !(theme ? declaration.prop.startsWith("--") : patterns.scopedPrefix.test(declaration.prop))
      ) {
        return;
      }
      if (
        patterns.compatibilityFile.test(normalize(path)) &&
        patterns.upstreamAlias.test(declaration.prop) &&
        patterns.scopedAliasValue.test(declaration.value)
      ) {
        return;
      }
      if (
        !patterns.placeholderPurpose.test(declaration.prop) &&
        (patterns.scopedToken.test(declaration.prop) ||
          patterns.referenceScale.test(declaration.prop))
      ) {
        return;
      }
      diagnostics.push({
        column: declaration.source?.start?.column ?? 1,
        line: declaration.source?.start?.line ?? 1,
        message: `${declaration.prop}: use --{ref,sys,cmp}-{property}-{purpose} (for example --sys-color-ink-muted). Keep upstream aliases in styles/olyx-compat.css.`,
        path,
        rule: "contracts/tokenName",
      });
    });
  } catch (error) {
    diagnostics.push({
      column: 1,
      line: 1,
      message: error instanceof Error ? error.message : String(error),
      path,
      rule: "contracts/cssParse",
    });
  }
  return diagnostics;
}

const privateButtonAttributes = new Set(["data-frost", "data-ripple"]);
const privateDialClasses = new Set([
  "dial-control",
  "dial-face",
  "dial-index",
  "dial-input",
  "dial-rotor",
  "dial-ticks",
  "dial-tick-light",
  "dial-tick-major",
  "dial-tick-minor",
  "dial-value",
]);
function nestedSelectors(component: SelectorComponent): Selector[] {
  const children: Selector[] = [];
  if ("selector" in component) {
    children.push(component.selector);
  }
  if ("of" in component && component.of) {
    children.push(...component.of);
  }
  if ("selectors" in component && component.selectors) {
    if (component.kind === "host") {
      children.push(component.selectors);
    } else {
      children.push(...component.selectors);
    }
  }
  return children;
}
function invalidSelectorParts(component: SelectorComponent, system: boolean): string[] {
  if (!system) {
    if (component.type === "class" && privateDialClasses.has(component.name)) {
      return [`.${component.name}`];
    }
    return component.type === "attribute" &&
      privateButtonAttributes.has(component.name.toLowerCase())
      ? [component.name.toLowerCase()]
      : [];
  }
  if (component.type === "attribute") {
    const value = component.name.startsWith("data-") ? component.operation?.value : undefined;
    return [component.name, value ?? ""].filter(usesProductName);
  }
  return (component.type === "class" || component.type === "id") && usesProductName(component.name)
    ? [component.name]
    : [];
}
function selectorNames(
  selector: Selector,
  system: boolean,
  found = new Set<string>()
): Set<string> {
  for (const component of selector) {
    for (const name of invalidSelectorParts(component, system)) {
      found.add(name);
    }
    for (const child of nestedSelectors(component)) {
      selectorNames(child, system, found);
    }
  }
  return found;
}
function privateSelectorGuidance(name: string): string {
  if (name.startsWith(".")) {
    return `${name} is a private Dial part. Set --cmp-size-dial-diameter on its container for layout or supply formatValue for its label.`;
  }
  return `[${name}] is a private material layer. Button defaults to frost; use appearance="inset" for a recessed action. Configure documented properties on the button root.`;
}

function checkStyleSelectors({ path, text }: ContractSource): ContractDiagnostic[] {
  const system = isSystemSource(normalize(path));
  if (!((system || normalize(path).startsWith("src/features/")) && path.endsWith(".css"))) {
    return [];
  }
  const diagnostics: ContractDiagnostic[] = [];
  try {
    transform({
      code: Buffer.from(text),
      filename: path,
      visitor: {
        Rule: {
          style(rule) {
            const names = new Set(
              rule.value.selectors.flatMap((selector) => [...selectorNames(selector, system)])
            );
            for (const name of names) {
              diagnostics.push({
                column: rule.value.loc.column,
                line: rule.value.loc.line + 1,
                message: system
                  ? `${name}: name this system selector for its visual or interaction role.`
                  : privateSelectorGuidance(name),
                path,
                rule: selectorRule(system, name),
              });
            }
          },
        },
      },
    });
  } catch (error) {
    diagnostics.push({
      column: 1,
      line: 1,
      message: error instanceof Error ? error.message : String(error),
      path,
      rule: "contracts/cssParse",
    });
  }
  return diagnostics;
}

function selectorRule(system: boolean, name: string): string {
  if (system) {
    return "contracts/systemName";
  }
  return name.startsWith(".") ? "contracts/privateDialSelector" : "contracts/privateButtonSelector";
}

function checkStyleFiles(sources: ContractSource[]): ContractDiagnostic[] {
  const diagnostics: ContractDiagnostic[] = [];
  for (const source of sources) {
    if (isSystemSource(source.path) && usesProductName(source.path)) {
      diagnostics.push({
        column: 1,
        line: 1,
        message:
          "Name this system module for the visual or interaction role it serves across features.",
        path: source.path,
        rule: "contracts/systemName",
      });
    }
    const tokenDiagnostics = checkTokenNames(source);
    diagnostics.push(...tokenDiagnostics);
    if (!tokenDiagnostics.some((item) => item.rule === "contracts/cssParse")) {
      diagnostics.push(...checkStyleSelectors(source));
    }
  }
  return diagnostics;
}

/** Compiler symbols own discovery; documentation heuristics assist rather than replace review. */
export function analyzeDesignContracts(
  sources: ContractSource[],
  root = process.cwd()
): ContractDiagnostic[] {
  const input = new Map(sources.map((file) => [normalize(resolve(root, file.path)), file.text]));
  const program = createContractProgram(input, root);
  const checker = program.getTypeChecker();
  const diagnostics: ContractDiagnostic[] = [];
  const seen = new Set<string>();
  const report: Report = (node, rule, message) => {
    const file = node.getSourceFile();
    const position = file.getLineAndCharacterOfPosition(node.getStart(file));
    const path = normalize(relative(root, file.fileName));
    const key = `${path}:${position.line}:${position.character}:${rule}:${message}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    diagnostics.push({
      column: position.character + 1,
      line: position.line + 1,
      message,
      path,
      rule,
    });
  };
  const exports = new PublicExports(checker, program, root, report);
  for (const diagnostic of program.getSyntacticDiagnostics()) {
    if (diagnostic.file && input.has(normalize(resolve(diagnostic.file.fileName)))) {
      report(
        diagnostic.file,
        "contracts/parse",
        ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")
      );
    }
  }
  for (const source of program.getSourceFiles()) {
    if (!input.has(normalize(resolve(source.fileName)))) {
      continue;
    }
    const path = normalize(relative(root, source.fileName));
    if (isSystemSource(path)) {
      checkSystemModule(path, source, checker, report);
    }
    const family = componentPath.exec(path);
    if (family && !testModule.test(path)) {
      exports.inspect(source, family);
    }
    if (patterns.motionFile.test(path)) {
      checkMotion(source, checker, report);
    }
  }
  diagnostics.push(...checkStyleFiles(sources));
  return diagnostics;
}
function collect(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    if (statSync(path).isDirectory()) {
      return collect(path);
    }
    return patterns.sourceExtension.test(path) ? [path] : [];
  });
}
if (import.meta.main) {
  const root = resolve(process.argv[2] ?? ".");
  const componentDirectory = normalize(resolve(root, "src/components"));
  const files = collect(resolve(root, "src")).filter(
    (path) => path.endsWith(".css") || normalize(path).startsWith(`${componentDirectory}/`)
  );
  const diagnostics = analyzeDesignContracts(
    files.map((path) => ({ path: relative(root, path), text: readFileSync(path, "utf8") })),
    root
  );
  for (const item of diagnostics) {
    console.error(
      `${resolve(root, item.path)}:${item.line}:${item.column} ${item.rule}: ${item.message}`
    );
  }
  console.log(
    `Design contracts: ${diagnostics.length ? `${diagnostics.length} errors` : "passed"}.`
  );
  if (diagnostics.length) {
    process.exitCode = 1;
  }
}
