import { defineConfig } from "vite";
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
    plugins: [qwikVite(), tsconfigPaths(), tailwindcss()],
  };
});
