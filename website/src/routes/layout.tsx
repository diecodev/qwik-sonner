import { component$, Slot, useStyles$ } from "@qwik.dev/core";
import { routeLoader$ } from "@qwik.dev/router";
import type { RequestHandler } from "@qwik.dev/router";

import styles from "./styles.css?inline";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // To redirect based on host, also destructure `url` and `redirect` from the args:
  // const { host } = url;
  // if (host === "qwik-sonner.deno.dev" || host === "localhost:5173") {
  //   throw redirect(301, "https://qwik-sonner.dieco.dev");
  // }

  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  });
};

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export default component$(() => {
  useStyles$(styles);
  return (
    <main>
      <Slot />
    </main>
  );
});
