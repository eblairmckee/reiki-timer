import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { defaultConfig } from "@/features/timer/model/timer-config";
import { TimerSettings } from "./timer-settings";

test.each([
  ["warmUp", "Warm up", "slider", "Warm up time"],
  ["coolDown", "Cool down", "slider", "Cool down time"],
  ["showTime", "Show timer", "switch", "Show breakdown"],
  ["chimes", "Chimes", "group", "Tone"],
] as const)(
  "%s keeps preference semantics and controls its dependent panel",
  async (preference, label, role, name) => {
    const user = userEvent.setup({ document });
    const onChange = vi.fn();
    const config = { ...defaultConfig, [preference]: true, chimeOnChange: true };
    const props = { audioError: "", config, onChange, onPreviewChime: vi.fn() };
    const { rerender } = render(<TimerSettings {...props} />);
    const control = screen.getByRole("switch", { name: label });
    const dependent = screen.getByRole(role, { name });
    const panel = dependent.closest("[data-ui=collapsible-panel]");
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(control.getAttribute("aria-controls")).toBe(panel?.id);
    await user.click(control);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toMatchObject({ [preference]: false });
    // The preference owner updates both the switch and the panel together.
    expect(screen.getByRole(role, { name })).toBe(dependent);
    rerender(<TimerSettings {...props} config={{ ...config, [preference]: false }} />);
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(control.hasAttribute("aria-expanded")).toBe(false);
    expect(control.hasAttribute("aria-controls")).toBe(false);
    expect(screen.queryByRole(role, { name })).toBeNull();
    expect(!panel?.isConnected || panel.hasAttribute("inert")).toBe(true);
    expect(!panel?.isConnected || panel.getAttribute("aria-hidden") === "true").toBe(true);
    expect(document.activeElement).toBe(control);
  }
);
