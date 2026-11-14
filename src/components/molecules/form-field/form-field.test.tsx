import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { FormField } from ".";

test("associates authored controls with their field copy and external errors", () => {
  render(
    <>
      <FormField description="Name used for reports." label="Display name">
        {(attributes) => <input {...attributes} />}
      </FormField>
      <FormField
        controlId="handle"
        describedBy="handle-error"
        description="Use letters and numbers."
        label="Handle"
        renderDescription={({ children, id }) => <p id={id}>{children}</p>}
        renderLabel={({ children, htmlFor, id }) => (
          <label htmlFor={htmlFor} id={id}>
            <strong>{children}</strong>
          </label>
        )}
        requiredIndicator="Required"
      >
        {(attributes) => <input {...attributes} required />}
      </FormField>
      <p id="handle-error">This handle is taken.</p>
    </>
  );
  const displayName = screen.getByRole<HTMLInputElement>("textbox", { name: "Display name" });
  const handle = screen.getByRole<HTMLInputElement>("textbox", { name: "Handle" });
  expect(displayName.id).not.toBe(handle.id);
  expect(displayName.labels?.[0]?.textContent).toBe("Display name");
  expect(displayName.getAttribute("aria-describedby")).toBe(
    screen.getByText("Name used for reports.").id
  );
  expect(handle.labels?.[0]?.htmlFor).toBe("handle");
  expect(handle.required).toBe(true);
  expect(handle.getAttribute("aria-describedby")).toBe(
    `${screen.getByText("Use letters and numbers.").id} handle-error`
  );
});
