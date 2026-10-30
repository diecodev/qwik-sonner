import { ssgAdapter } from "@qwik.dev/router/adapters/ssg/vite";
import { extendConfig } from "@qwik.dev/router/vite";
import baseConfig from "../../vite.config";

// Every route prerendered into dist/: Vercel serves it as static files.
export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rolldownOptions: {
        input: ["@qwik-router-config"],
      },
    },
    plugins: [
      ssgAdapter({
        origin: "https://qwik-sonner.dieco.dev",
        // `/docs` only redirects: vercel.json answers it in production, and a
        // redirect can't be prerendered.
        exclude: ["/docs"],
      }),
    ],
  };
});
