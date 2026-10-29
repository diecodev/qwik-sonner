import { defineConfig, type Plugin } from "vite";
import { qwikVite } from "@qwik.dev/core/optimizer";
import tsconfigPaths from "vite-tsconfig-paths";
import pkg from "./package.json";
import tailwindcss from "@tailwindcss/vite";

type DepMap = Record<string, string>;
const { dependencies = {}, peerDependencies = {} } = pkg as {
  dependencies?: DepMap;
  peerDependencies?: DepMap;
};

// Anything declared as a (peer)dependency must NOT be bundled into the library.
// Consumers install these themselves, which keeps the output small and
// dedupable (e.g. @qwik.dev/core).
const makeRegex = (dep: string) => new RegExp(`^${dep}(/.*)?$`);
const external = [
  /^node:.*/,
  ...Object.keys(dependencies).map(makeRegex),
  ...Object.keys(peerDependencies).map(makeRegex),
];

// `qwikVite()` emits an app manifest (`q-manifest.json` + `*-bundle-graph.json`)
// for every client build, lib mode included. A library has no use for it, and
// `lib/` is published as-is, so drop it once Qwik has emitted it.
const dropAppManifest: Plugin = {
  name: "qwik-sonner:drop-app-manifest",
  enforce: "post",
  generateBundle: {
    order: "post",
    handler(_options, bundle) {
      for (const fileName of Object.keys(bundle)) {
        if (fileName === "q-manifest.json" || fileName.endsWith("-bundle-graph.json")) {
          delete bundle[fileName];
        }
      }
    },
  },
};

export default defineConfig(() => {
  return {
    build: {
      target: "es2020",
      outDir: "lib",
      emptyOutDir: true,
      // Single pass, two entry points. Code shared by both (the headless core)
      // is hoisted into a shared chunk instead of being duplicated.
      lib: {
        entry: {
          index: "src/lib/index.ts",
          headless: "src/lib/headless/toast-wrapper.tsx",
        },
        formats: ["es"],
        fileName: (_format, entryName) => `${entryName}.qwik.mjs`,
      },
      rollupOptions: {
        external,
        output: {
          chunkFileNames: "[name]-[hash].qwik.mjs",
        },
      },
    },
    plugins: [qwikVite(), tsconfigPaths(), tailwindcss(), dropAppManifest],
  };
});
