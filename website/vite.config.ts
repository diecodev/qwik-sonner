import { defineConfig, type UserConfig } from "vite";
import { qwikVite } from "@qwik.dev/core/optimizer";
import { qwikRouter } from "@qwik.dev/router/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import library from "../package.json" with { type: "json" };
import { readReleases } from "./src/lib/github";
import { readNpm } from "./src/lib/npm";

export default defineConfig(async (): Promise<UserConfig> => {
  // The published versions, their dist-tags and days, and the notes of each
  // GitHub release, for src/lib/release.ts: read once per build (or dev-server
  // start) and inlined as constants, so nothing hits npm or GitHub at runtime.
  const [npm, releases] = await Promise.all([readNpm(library.version), readReleases()]);

  return {
    define: {
      __NPM__: JSON.stringify(npm),
      __RELEASES__: JSON.stringify(releases),
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
