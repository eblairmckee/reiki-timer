import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

const root = fileURLToPath(new URL("../", import.meta.url));

// Actual files in the configured component scope exercise the contributor command,
// including inherited rules and overrides. Each trial removes its fixture on failure.
function lint(source: string, scope = "components") {
  const directory = mkdtempSync(join(root, `src/${scope}/.lint-policy-`));
  try {
    const path = join(directory, "case.test.tsx");
    writeFileSync(path, source);
    const result = spawnSync("bun", ["run", "lint", path], {
      cwd: root,
      encoding: "utf8",
    });
    if (result.error) {
      throw result.error;
    }
    return { output: result.stdout + result.stderr, status: result.status };
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
}

test("shared imports reject feature coupling and accept system composition", () => {
  for (const path of [
    "@/features/timer/screens/timer-layout/timer-layout",
    "../../features/timer/screens/timer-layout/timer-layout",
  ]) {
    const bad = lint(`import { TimerLayout } from "${path}";\nexport const Screen = TimerLayout;`);
    expect(bad.status).toBe(1);
    expect(bad.output).toContain("noRestrictedImports");
  }
  expect(
    lint(
      'import { Button } from "@/components/design-system/button";\nexport const Control = Button;'
    ).status
  ).toBe(0);
});

test("a default cannot hide a missing local union member", () => {
  const bad = lint(
    'export function choose(value: "a" | "b") { switch (value) { case "a": return 1; default: return 0; } }'
  );
  expect(bad.status).toBe(1);
  expect(bad.output).toContain("useExhaustiveSwitchCases");
  expect(
    lint(
      'export function choose(value: "a" | "b") { switch (value) { case "a": return 1; case "b": return 2; default: return 0; } }'
    ).status
  ).toBe(0);
});

test("focused tests block verification; skipped tests remain visible warnings", () => {
  const body = '("behavior", () => { expect(true).toBe(true); });';
  const imports = 'import { expect, test } from "vitest";\n';
  const bad = lint(`${imports}test.only${body}`);
  expect(bad.status).toBe(1);
  expect(bad.output).toContain("noFocusedTests");
  const skipped = lint(`${imports}test.skip${body}`);
  expect(skipped.status).toBe(0);
  expect(skipped.output).toContain("noSkippedTests");
  expect(lint(`${imports}test${body}`).status).toBe(0);
});

test("neutral hooks and utilities reject feature/UI imports and accept neutral dependencies", () => {
  for (const scope of ["hooks", "utils"]) {
    for (const path of ["@/features/timer/data/chimes", "@/components/design-system/button"]) {
      const bad = lint(
        `import * as dependency from "${path}";\nexport const value = dependency;`,
        scope
      );
      expect(bad.status).toBe(1);
      expect(bad.output).toContain("noRestrictedImports");
    }
    expect(
      lint(
        'import { formatClock } from "@/utils/time/format-duration";\nexport const clock = formatClock;',
        scope
      ).status
    ).toBe(0);
  }
});
