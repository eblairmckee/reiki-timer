import { afterEach } from "bun:test";
import { Window } from "happy-dom";

const window = new Window({ url: "http://localhost:5173" });
Object.assign(globalThis, {
  window,
  document: window.document,
  navigator: window.navigator,
  HTMLElement: window.HTMLElement,
  Element: window.Element,
  Node: window.Node,
  NodeFilter: window.NodeFilter,
  DocumentFragment: window.DocumentFragment,
  MutationObserver: window.MutationObserver,
  ResizeObserver: window.ResizeObserver,
  getComputedStyle: window.getComputedStyle.bind(window),
  requestAnimationFrame: window.requestAnimationFrame.bind(window),
  cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
  IS_REACT_ACT_ENVIRONMENT: true,
});

const { act, cleanup } = await import("@testing-library/react");
afterEach(async () => {
  await act(async () => {
    await window.happyDOM.waitUntilComplete();
  });
  cleanup();
});
