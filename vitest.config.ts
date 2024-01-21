import { qwikVite } from "@builder.io/qwik/optimizer";
import { defineConfig, defaultExclude } from "vitest/config";

export default defineConfig({
  plugins: [qwikVite({ devSsrServer: false })],
  test: {
    globals: true,
    exclude: [...defaultExclude],
    browser: {
      enabled: true,
      name: "edge",
      headless: false,
    },
  },
});