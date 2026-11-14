import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ComponentProps, createRef, useState } from "react";
import { expect, test, vi } from "vitest";
import { TagInput } from ".";

const removeName = /^Remove /u;

function DocumentTags(props: Partial<ComponentProps<typeof TagInput>>) {
  const [values, setValues] = useState(["Draft"]);
  return (
    <TagInput
      aria-label="Document tags"
      onValuesChange={setValues}
      options={["Review", "review", "Published"]}
      values={values}
      {...props}
    />
  );
}

test("commits document tags from suggestions, delimiters, and a selected-range paste", async () => {
  const user = userEvent.setup();
  render(<DocumentTags />);
  const input = screen.getByRole<HTMLInputElement>("combobox", { name: "Document tags" });
  await user.type(input, "rev{Enter}");
  expect(screen.getByRole("button", { name: "Remove Review" })).toBeTruthy();
  await user.type(input, "REVIEW{Enter}");
  expect(screen.getByRole("button", { name: "Remove Review" })).toBeTruthy();
  await user.type(input, "review,EDIT,");
  expect(screen.getByRole("button", { name: "Remove EDIT" })).toBeTruthy();
  await user.type(input, "placeholder");
  input.setSelectionRange(2, 7);
  await user.paste("st, draft, Work");
  expect(screen.getByRole("button", { name: "Remove plst" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Remove Worklder" })).toBeTruthy();
  expect(screen.getAllByRole("button", { name: removeName })).toHaveLength(5);
  expect(input.value).toBe("");
  await user.keyboard("{Escape}");
  expect(screen.getAllByRole("button", { name: removeName })).toHaveLength(5);
  await user.click(screen.getByRole("button", { name: "Remove Review" }));
  expect(screen.queryByRole("button", { name: "Remove Review" })).toBeNull();
});

test("reflects only parent-provided committed values and forwards native input props", async () => {
  const user = userEvent.setup();
  const onValuesChange = vi.fn();
  const formRef = createRef<HTMLFormElement>();
  const ref = createRef<HTMLInputElement>();
  const props = { name: "document-tags", onValuesChange, ref };
  const { rerender } = render(
    <form ref={formRef}>
      <DocumentTags {...props} values={["Draft"]} />
    </form>
  );
  const input = screen.getByRole<HTMLInputElement>("combobox", { name: "Document tags" });
  expect(ref.current).toBe(input);
  await user.type(input, "Published,");
  expect(onValuesChange).toHaveBeenCalledExactlyOnceWith(["Draft", "Published"]);
  expect(screen.queryByRole("button", { name: "Remove Published" })).toBeNull();
  rerender(
    <form ref={formRef}>
      <DocumentTags {...props} values={["Reviewed", "Published"]} />
    </form>
  );
  expect(screen.queryByRole("button", { name: "Remove Draft" })).toBeNull();
  expect(screen.getByRole("button", { name: "Remove Published" })).toBeTruthy();
  expect(new FormData(formRef.current ?? undefined).getAll("document-tags")).toEqual([
    "Reviewed",
    "Published",
  ]);
});

test("allows caller cancellation and leaves composing input with the browser", async () => {
  const user = userEvent.setup();
  const onValuesChange = vi.fn();
  render(
    <DocumentTags
      onKeyDown={(event) => {
        if (!event.nativeEvent.isComposing && (event.key === "Enter" || event.key === ",")) {
          event.preventDefault();
        }
      }}
      onPaste={(event) => event.preventBaseUIHandler()}
      onValuesChange={onValuesChange}
    />
  );
  const input = screen.getByRole<HTMLInputElement>("combobox", { name: "Document tags" });
  await user.type(input, "rev{Enter},");
  await user.paste("internal, team");
  expect(onValuesChange).not.toHaveBeenCalled();
  expect(input.value).toBe("revinternal, team");
  fireEvent.keyDown(input, { isComposing: true, key: "Enter" });
  expect(onValuesChange).not.toHaveBeenCalled();
});

test("keeps tag inputs independent and accepts caller-authored option and chip content", async () => {
  const user = userEvent.setup();
  render(
    <>
      <DocumentTags
        renderOption={({ label }) => <em>Choose {label}</em>}
        renderTag={(value) => <strong>Tag: {value}</strong>}
      />
      <DocumentTags aria-label="Related documents" values={[]} />
    </>
  );
  const tags = screen.getByRole<HTMLInputElement>("combobox", { name: "Document tags" });
  const related = screen.getByRole<HTMLInputElement>("combobox", { name: "Related documents" });
  await user.type(tags, "rev");
  expect(screen.getByRole("option", { name: "Choose Review" })).toBeTruthy();
  expect(related.value).toBe("");
  await user.keyboard("{Enter}");
  expect(screen.getByText("Tag: Review")).toBeTruthy();
  await user.type(related, "Pub");
  expect(screen.getByRole("option", { name: "Published" })).toBeTruthy();
  expect(tags.value).toBe("");
});
