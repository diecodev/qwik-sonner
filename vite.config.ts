import { defineConfig } from "vite";
import pkg from "./package.json";
import { qwikVite } from "@builder.io/qwik/optimizer";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";

const { dependencies = {}, peerDependencies = {} } = pkg as any;
const makeRegex = (dep) => new RegExp(`^${dep}(/.*)?$`);
const excludeAll = (obj) => Object.keys(obj).map(makeRegex);

const lib = {
  raw: {
    entry: "./src/index.ts",
  },
  headless: {
    entry: "./src/headless/index.ts",
  },
} as const;

export default defineConfig(() => {
  const key = process.env.PKG ?? "raw";
  if (!(key in lib)) throw new Error(`Invalid package: ${key}`);

  const { entry } = lib[key as keyof typeof lib];
  return {
    build: {
      target: "es2020",
      outDir: ".",
      lib: {
        entry,
        formats: ["es", "cjs"],
        fileName: (format) => {
          const name = key === "raw" ? "index" : `${key}/index`;
          const ext = format === "es" ? "mjs" : "cjs";
          return `${name}.qwik.${ext}`;
        },
      },
      emptyOutDir: false,
      rollupOptions: {
        // externalize deps that shouldn't be bundled into the library
        external: [
          /^node:.*/,
          ...excludeAll(dependencies),
          ...excludeAll(peerDependencies),
        ],
      },
    },
    plugins: [
      dts({
        exclude: ["src/entry.*.tsx", "src/root.tsx"],
      }),
      qwikVite(),
      tsconfigPaths(),
    ],
  };
});
