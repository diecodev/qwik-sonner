import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

import { component$ } from "@builder.io/qwik";
const ogImage = "https://qwik-sonner.deno.dev/og.png";
/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  return (
    <>
      <title>Qwik Sonner</title>
      <meta name="og:title" content="Qwik Sonner" />

      {/* Description */}
      <meta
        name="description"
        content="An opinionated toast component for Qwik."
      />
      <meta
        name="og:description"
        content="An opinionated toast component for Qwik."
      />

      {/* Image */}
      <meta name="twitter:image" content={ogImage} />
      <meta name="og:image" content={ogImage} />

      {/* URL */}
      <meta name="og:url" content="https://qwik-sonner.deno.dev/" />

      {/* General */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@diecodev" />
      <meta name="author" content="Diego Díaz" />

      {/* Favicons */}
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="theme-color" content="#ffffff" />
      <link rel="shortcut icon" href="favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="apple-touch-icon.png"
      />

      <link rel="canonical" href={loc.url.href} />

      {head.meta.map((m) => (
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
