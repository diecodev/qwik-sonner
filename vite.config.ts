import { defineConfig } from "vite";
import pkg from "./package.json";
import { qwikVite } from "@builder.io/qwik/optimizer";
import tsconfigPaths from "vite-tsconfig-paths";

const { dependencies = {}, peerDependencies = {} } = pkg as any;
const makeRegex = (dep) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj) => Object.keys(obj).map(makeRegex);

export default defineConfig(() => {
  const env = process.env.ENTRY as "styled" | "headless" | undefined;

  if (!env) throw new Error("ENTRY env var is required");

  const entry =
    env === "headless" ? "src/lib/headless/toast-wrapper.tsx" : "src/lib";

  return {
    build: {
      target: "es2020",
      outDir: "lib",
      lib: {
        entry,
        formats: ["es", "cjs"],
        fileName: (format, file) => {
          const ext = format === "es" ? "mjs" : "cjs";
          const name = env === "styled" ? "index" : "headless";
          return `${name}.qwik.${ext}`;
        },
      },
      emptyOutDir: env === "styled" ? true : false,
      rollupOptions: {
        // externalize deps that shouldn't be bundled into the library
        external: [
          /^node:.*/,
          ...excludeAll(dependencies),
          ...excludeAll(peerDependencies),
        ],
        // all the chunks created by vite shuold also have qwik in the name
        output: {
          chunkFileNames: "[name]-[format].qwik.js",
        },
      },
    },
    plugins: [qwikVite(), tsconfigPaths()],
  };
});
