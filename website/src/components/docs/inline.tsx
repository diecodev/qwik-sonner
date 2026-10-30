import type { JSXOutput } from "@qwik.dev/core";

/**
 * Renders a tiny markdown subset used by data-driven copy (changelog entries,
 * API tables): `code` and **bold**. Everything else is plain text.
 */
export function inline(text: string): JSXOutput {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    return part;
  });
}
