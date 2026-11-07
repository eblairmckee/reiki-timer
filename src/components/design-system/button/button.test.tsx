import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { Input } from "../input";
import { InputGroupAffix, InputGroupIcon, InputGroupWrapper } from "../input-group";
import { LinkButton } from "../link-button";
import { Button } from ".";

describe("public control contracts", () => {
  test.each(["frost", "inset"] as const)(
    "%s owns the shared moving face and feedback",
    (appearance) => {
      render(<Button appearance={appearance}>Run</Button>);
      const button = screen.getByRole("button", { name: "Run" });
      expect(button.getAttribute("data-appearance")).toBe(appearance);
      expect(button.querySelector("[data-frost]")).not.toBeNull();
      expect(button.querySelector('[data-ripple="pressure"]')).not.toBeNull();
      expect(button.querySelector('[data-ripple="release"]')).not.toBeNull();
    }
  );

  test.each(["solid", "tonal", "ghost", "outline", "etched", "text", "link"] as const)(
    "%s remains available without a frost face",
    (appearance) => {
      render(<Button appearance={appearance}>Run</Button>);
      const button = screen.getByRole("button", { name: "Run" });
      expect(button.getAttribute("data-appearance")).toBe(appearance);
      expect(button.querySelector("[data-frost]")).toBeNull();
    }
  );
  test("directional icons expose the existing styling hook", () => {
    const view = render(<Button aria-label="Back" iconOnly />);
    const button = screen.getByRole("button", { name: "Back" });
    expect(button.getAttribute("data-flip-icon-in-rtl")).toBe("false");
    view.rerender(<Button aria-label="Back" hasDirectionalIcon iconOnly />);
    expect(button.getAttribute("data-flip-icon-in-rtl")).toBe("true");
  });

  test("repeated frosted previews preserve click, keyboard and disabled behavior", async () => {
    const activate = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    const view = render(
      <Button aria-label="Preview swatch" iconOnly onClick={activate} ref={ref}>
        <span aria-hidden="true">Bell</span>
      </Button>
    );
    const button = screen.getByRole("button", { name: "Preview swatch" });
    const user = userEvent.setup({ document });
    await user.click(button);
    await user.click(button);
    await user.keyboard("{Enter} ");
    expect(activate).toHaveBeenCalledTimes(4);
    expect(ref.current).toBe(button);
    expect(button.getAttribute("data-appearance")).toBe("frost");
    expect(button.hasAttribute("aria-pressed")).toBe(false);
    view.rerender(<Button aria-label="Preview swatch" disabled onClick={activate} />);
    await user.click(button);
    expect(activate).toHaveBeenCalledTimes(4);
  });

  test("link appearance retains button semantics and native cancellation", () => {
    const submit = vi.fn();
    const activate = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <Button appearance="link" intent="neutral" onClick={activate} type="submit">
          Preview
        </Button>
      </form>
    );
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(activate).toHaveBeenCalledTimes(1);
    expect(submit).not.toHaveBeenCalled();
  });

  test("input composition forwards label, className and refs to the input", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <InputGroupWrapper>
        Width
        <InputGroupIcon aria-hidden="true">Clock</InputGroupIcon>
        <Input className="consumer-input" ref={ref} />
        <InputGroupAffix aria-hidden="true" inline>
          m
        </InputGroupAffix>
      </InputGroupWrapper>
    );
    const input = screen.getByRole("textbox", { name: "Width" });
    expect(input.classList.contains("consumer-input")).toBe(true);
    expect(ref.current).toBe(input);
  });

  test("LinkButton preserves native element choice and repeated activation", async () => {
    const activate = vi.fn();
    render(
      <>
        <LinkButton href="#details" intent="muted">
          Details
        </LinkButton>
        <LinkButton as="button" onClick={activate}>
          Retry
        </LinkButton>
      </>
    );
    expect(screen.getByRole("link", { name: "Details" }).getAttribute("href")).toBe("#details");
    const button = screen.getByRole("button", { name: "Retry" });
    const user = userEvent.setup({ document });
    await user.click(button);
    await user.click(button);
    expect(activate).toHaveBeenCalledTimes(2);
    expect(button.getAttribute("type")).toBe("button");
  });
});
