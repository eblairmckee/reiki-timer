import { afterEach } from "bun:test";
import { Window } from "happy-dom";

const window = new Window({ url: "http://localhost:5173" });
// happy-dom eagerly rejects canceled WAAPI promises; exercise Motion's JS fallback here.
// The real browser review covers compositor animations and interruption.
Object.defineProperty(window.Element.prototype, "animate", {
  value: undefined,
  configurable: true,
});
Object.assign(globalThis, {
  window,
  document: window.document,
  navigator: window.navigator,
  HTMLElement: window.HTMLElement,
  HTMLInputElement: window.HTMLInputElement,
  HTMLButtonElement: window.HTMLButtonElement,
  SVGElement: window.SVGElement,
  PointerEvent: window.PointerEvent,
  Element: window.Element,
  Node: window.Node,
  NodeList: window.NodeList,
  NodeFilter: window.NodeFilter,
  DocumentFragment: window.DocumentFragment,
  MutationObserver: window.MutationObserver,
  ResizeObserver: window.ResizeObserver,
  getComputedStyle: window.getComputedStyle.bind(window),
  scrollTo: window.scrollTo.bind(window),
  requestAnimationFrame: window.requestAnimationFrame.bind(window),
  cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
  IS_REACT_ACT_ENVIRONMENT: true,
});

const { act, cleanup } = await import("@testing-library/react");
afterEach(async () => {
  cleanup();
  await act(async () => {
    await window.happyDOM.waitUntilComplete();
  });
});
