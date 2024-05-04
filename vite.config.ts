import { defineConfig } from "vite";
import pkg from "./package.json";
import { qwikVite } from "@builder.io/qwik/optimizer";
import tsconfigPaths from "vite-tsconfig-paths";

const { dependencies = {}, peerDependencies = {} } = pkg as any;
const makeRegex = (dep) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj) => Object.keys(obj).map(makeRegex);

export default defineConfig(() => {
  return {
    build: {
      target: "es2020",
      outDir: "lib",
      lib: {
        entry: {
          index: "./src/lib/",
          headless: "./src/lib/headless",
          core: "./src/lib/core",
        },
        formats: ["es", "cjs"],
        fileName: (format, file) => {
          const ext = format === "es" ? "mjs" : "cjs";
          return `${file}.qwik.${ext}`;
        },
        name: "qwik-toast",
      },
      emptyOutDir: true,
      rollupOptions: {
        // externalize deps that shouldn't be bundled into the library
        external: [
          /^node:.*/,
          ...excludeAll(dependencies),
          ...excludeAll(peerDependencies),
        ],
        // all the chunks created by vite shuold also have qwik in the name
        output: {
          chunkFileNames: "[name]-[hash].qwik.js",
        },
      },
    },
    plugins: [qwikVite(), tsconfigPaths()],
  };
});
