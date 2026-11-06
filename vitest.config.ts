import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    projects: [
      {
        extends: true,
        test: {
          environment: "happy-dom",
          environmentOptions: { happyDOM: { url: "http://localhost:5173" } },
          exclude: ["src/components/ui/styles/theme.test.ts"],
          include: ["src/**/*.test.{ts,tsx}"],
          name: "unit",
          setupFiles: ["./test/setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium" }],
            // Audit settled accessible states; the app removes reveal fades and freezes decoration.
            provider: playwright({ contextOptions: { reducedMotion: "reduce" } }),
          },
          include: ["src/components/ui/styles/theme.test.ts", "test/browser/**/*.test.tsx"],
          name: "chromium",
        },
      },
    ],
  },
});
