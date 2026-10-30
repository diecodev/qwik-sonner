import { useDocumentHead, useLocation } from "@qwik.dev/router";

import { component$ } from "@qwik.dev/core";
const ogImage = "https://qwik-sonner.dieco.dev/og.png";
const DEFAULT_TITLE = "Qwik Sonner";
const DEFAULT_DESCRIPTION = "An opinionated toast component for Qwik.";
/**
 * The RouterHead component is placed inside of the document `<head>` element.
 * Each page's `head` export sets the title and description; the defaults cover
 * pages without one.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();
  const title = head.title || DEFAULT_TITLE;
  const description =
    head.meta.find((m) => m.name === "description")?.content ?? DEFAULT_DESCRIPTION;

  return (
    <>
      <title>{title}</title>
      <meta name="og:title" content={title} />

      {/* Description */}
      <meta name="description" content={description} />
      <meta name="og:description" content={description} />

      {/* Image */}
      <meta name="twitter:image" content={ogImage} />
      <meta name="og:image" content={ogImage} />

      {/* URL */}
      <meta name="og:url" content={loc.url.href} />

      {/* General */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@diecodev" />
      <meta name="author" content="Diego Díaz" />

      {/* Favicons */}
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="theme-color" content="#ffffff" />
      <link rel="shortcut icon" href="/favicon.ico" />

      <link rel="canonical" href={loc.url.href} />

      {/* The description is already rendered above. */}
      {head.meta
        .filter((m) => m.name !== "description")
        .map((m) => (
          <meta key={m.key} {...m} />
        ))}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style key={s.key} {...s.props} dangerouslySetInnerHTML={s.style} />
      ))}

      {head.scripts.map((s) => (
        <script key={s.key} {...s.props} dangerouslySetInnerHTML={s.script} />
      ))}
    </>
  );
});
