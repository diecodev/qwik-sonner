import { component$ } from "@qwik.dev/core";
import type { DocumentHead } from "@qwik.dev/router";
import { NotFound } from "~/components/NotFound";

// Qwik Router's SSG (2.0.0-beta.37) prerenders index routes only, never 404.tsx.
// This route renders the same page so the build can copy it to dist/404.html,
// which Vercel serves for every missing address (scripts/emit-404.mjs).
export default component$(() => <NotFound prerendered />);

export const head: DocumentHead = {
  title: "Page not found — qwik-sonner",
  meta: [{ name: "robots", content: "noindex" }],
};
