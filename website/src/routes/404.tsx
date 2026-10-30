import { component$ } from "@qwik.dev/core";
import type { DocumentHead } from "@qwik.dev/router";
import { NotFound } from "~/components/NotFound";
import { SiteShell } from "~/components/SiteShell";

// Missing pages in dev and after client-side navigation. The static site's
// 404.html comes from routes/not-found (see scripts/emit-404.mjs).
//
// Qwik Router renders a not-found page on its own, without routes/layout.tsx,
// so it brings the Toasters and their context itself (useContext would throw
// Q8 otherwise and take the dev server down).
export default component$(() => (
  <SiteShell>
    <NotFound />
  </SiteShell>
));

export const head: DocumentHead = {
  title: "Page not found — qwik-sonner",
  meta: [{ name: "robots", content: "noindex" }],
};
