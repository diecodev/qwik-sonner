import { defineConfig, type UserConfig } from "vite";
import { qwikVite } from "@qwik.dev/core/optimizer";
import { qwikRouter } from "@qwik.dev/router/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import library from "../package.json" with { type: "json" };
import { readNpm } from "./src/lib/npm";

export default defineConfig(async (): Promise<UserConfig> => {
  // The published versions, their dist-tags and days, for src/lib/release.ts:
  // read once per build (or dev-server start) and inlined as a constant, so
  // nothing hits the registry at runtime.
  const npm = await readNpm(library.version);

  return {
    define: {
      __NPM__: JSON.stringify(npm),
    },
    plugins: [qwikRouter(), qwikVite(), tsconfigPaths()],
    server: {
      headers: {
        "Cache-Control": "public, max-age=0",
      },
    },
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
  };
});
