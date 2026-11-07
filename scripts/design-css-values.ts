import valueParser from "postcss-value-parser";

const motionProperty =
  /^(?:-webkit-)?(?:animation|transition)(?:-(?:duration|delay|timing-function))?$/u;
const timeUnit = /^(?:ms|s)$/iu;
const backdropProperty = /^(?:-webkit-)?backdrop-filter$/u;
const motionToken = /^--(?:ref|sys|cmp)-motion-/u;
const filterToken = /^--(?:ref|sys|cmp)-filter-/u;
const easingKeywords = new Set([
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "linear",
  "step-start",
  "step-end",
]);
const easingFunctions = new Set(["cubic-bezier", "steps", "linear"]);

/** Inspect literal leaves, including calc expressions and every var() fallback. */
export function hasLiteralMotion(property: string, value: string): boolean {
  const motionUse = motionProperty.test(property.toLowerCase());
  const privateProperty = property.startsWith("--") && !motionToken.test(property);
  if (!(motionUse || privateProperty)) {
    return false;
  }
  let literal = false;
  valueParser(value).walk((node) => {
    if (node.type === "function" && easingFunctions.has(node.value.toLowerCase())) {
      literal = true;
      return false;
    }
    if (node.type !== "word") {
      return;
    }
    const dimension = valueParser.unit(node.value);
    if (
      (motionUse && easingKeywords.has(node.value.toLowerCase())) ||
      (dimension && timeUnit.test(dimension.unit) && Number(dimension.number) !== 0)
    ) {
      literal = true;
    }
  });
  return literal;
}

/** Filter profiles hold whole filter lists; consumers may only spell blur(0) directly. */
export function hasRawBackdropBlur(property: string, value: string): boolean {
  const privateProperty = property.startsWith("--") && !filterToken.test(property);
  if (!(backdropProperty.test(property.toLowerCase()) || privateProperty)) {
    return false;
  }
  let raw = false;
  valueParser(value).walk((node) => {
    if (node.type !== "function" || node.value.toLowerCase() !== "blur") {
      return;
    }
    const arguments_ = node.nodes.filter(
      (part) => part.type !== "space" && part.type !== "comment"
    );
    const [argument] = arguments_;
    const dimension = argument?.type === "word" ? valueParser.unit(argument.value) : false;
    if (!(arguments_.length === 1 && dimension && Number(dimension.number) === 0)) {
      raw = true;
    }
    return false;
  });
  return raw;
}
