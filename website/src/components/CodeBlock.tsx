import { component$, type ClassList, type CSSProperties } from "@qwik.dev/core";
import { highlight } from "sugar-high";
import { CopyButton } from "./CopyButton";
import styles from "./codeblock.module.css";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export interface CodeBlockProps {
  code: string;
  /** `tsx` (default) is syntax highlighted; `sh` and `text` render verbatim. */
  lang?: "tsx" | "css" | "sh" | "text";
  /** Optional caption, e.g. a file name. */
  title?: string;
  class?: ClassList;
  style?: CSSProperties;
}

export const CodeBlock = component$<CodeBlockProps>(
  ({ code, lang = "tsx", title, class: className, style }) => {
    const html = lang === "tsx" || lang === "css" ? highlight(code) : escapeHtml(code);

    return (
      <figure class={[styles.block, className]} style={style} data-lang={lang}>
        {title ? <figcaption class={styles.title}>{title}</figcaption> : null}
        <pre class={styles.pre}>
          <code class={styles.code} dangerouslySetInnerHTML={html} />
        </pre>
        <CopyButton text={code} class={styles.copy} />
      </figure>
    );
  },
);
