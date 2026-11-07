import { act } from "@testing-library/react";
import { userEvent as nativeUserEvent } from "vitest/browser";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

// Native Playwright input and CDP preference changes run outside React's event
// wrappers. Flush their resulting React updates before the next assertion.
export async function browserAction(operation: () => Promise<unknown>): Promise<void> {
  await act(async () => {
    await operation();
  });
}

export const userEvent = {
  cleanup: () => browserAction(() => nativeUserEvent.cleanup()),
  click: (...args: Parameters<typeof nativeUserEvent.click>) =>
    browserAction(() => nativeUserEvent.click(...args)),
  keyboard: (...args: Parameters<typeof nativeUserEvent.keyboard>) =>
    browserAction(() => nativeUserEvent.keyboard(...args)),
  pointer: (...args: Parameters<typeof nativeUserEvent.pointer>) =>
    browserAction(() => nativeUserEvent.pointer(...args)),
  tab: (...args: Parameters<typeof nativeUserEvent.tab>) =>
    browserAction(() => nativeUserEvent.tab(...args)),
};
