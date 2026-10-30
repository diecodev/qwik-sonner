import { component$ } from "@qwik.dev/core";
import type { DocumentHead } from "@qwik.dev/router";
import { NotFound } from "~/components/NotFound";

// The static copy of the 404 page: rendered as prerendered, so it doesn't show
// the build-time address, and copied to dist/404.html, which Vercel serves for
// every missing address (scripts/emit-404.mjs).
export default component$(() => <NotFound prerendered />);

export const head: DocumentHead = {
  title: "Page not found — qwik-sonner",
  meta: [{ name: "robots", content: "noindex" }],
};
