import { type JSXNode } from "@builder.io/qwik";
import { renderToString } from "@builder.io/qwik/server";
import SampleComponent from "./component";
import { test, expect } from "vitest";
// import { QwikManifest, SymbolMapperFn } from "@builder.io/qwik/optimizer";
// import { manifest } from "@qwik-client-manifest";
// import { isDev } from "@builder.io/qwik/build";

const createApp = async (Component: JSXNode) => {
  const container = await renderToString(Component, {
    containerTagName: "div",
    containerAttributes: { style: "display: contents" },
    // manifest: isDev ? ({} as QwikManifest) : manifest,
    // symbolMapper: manifest ? undefined : symbolMapper,
    qwikLoader: { include: "always" },
  });

  // const root = await render(container, <Component />, opts);

  await nextTick();
  return container;
};

export async function nextTick() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

test("component sohould render", async () => {
  const wrapper = await createApp(<SampleComponent />);

  expect(wrapper.html).toContain("open toaster");
});
