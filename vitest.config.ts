import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// Use the production document's early cascade declaration before the tester loads
// any component CSS. Keeping its text in index.html avoids a second layer policy.
const productionHtml = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const cascadeStyle = [...productionHtml.matchAll(/<style\b[^>]*>(?<css>[\s\S]*?)<\/style>/gu)]
  .map((match) => match.groups?.css ?? "")
  .find((style) => style.includes("@layer"));
if (!cascadeStyle) {
  throw new Error("Expected the production document to establish CSS layer precedence");
}

export default defineConfig({
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@base-ui/react/button",
      "@base-ui/react/switch",
      "@base-ui/react/separator",
      "@base-ui/react/collapsible",
      "@base-ui/react/use-render",
      "@base-ui/react/input",
      "@base-ui/react/number-field",
      "@base-ui/react/dialog",
    ],
  },
  plugins: [
    react(),
    {
      name: "production-cascade-order",
      transformIndexHtml() {
        return [{ children: cascadeStyle, injectTo: "head-prepend", tag: "style" }];
      },
    },
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    projects: [
      {
        extends: true,
        test: {
          environment: "node",
          include: ["scripts/**/*.test.ts"],
          name: "tooling",
        },
      },
      {
        extends: true,
        test: {
          environment: "happy-dom",
          environmentOptions: { happyDOM: { url: "http://localhost:5173" } },
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
          include: ["test/browser/**/*.test.{ts,tsx}"],
          name: "chromium",
        },
      },
    ],
  },
});
