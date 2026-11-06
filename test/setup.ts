import { act, cleanup } from "@testing-library/react";
import type { Window } from "happy-dom";
import { afterEach } from "vitest";

// Exercise Motion's JS fallback; Chromium covers browser styling separately.
Object.defineProperty(Element.prototype, "animate", {
  configurable: true,
  value: undefined,
});
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

afterEach(async () => {
  cleanup();
  await act(async () => {
    await (window as unknown as Window).happyDOM.waitUntilComplete();
  });
});
