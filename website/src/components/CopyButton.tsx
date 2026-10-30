import { component$, useSignal, type ClassList } from "@qwik.dev/core";
import copy from "copy-to-clipboard";
import styles from "./copy-button.module.css";

export const CopyButton = component$<{ text: string; class?: ClassList; label?: string }>(
  ({ text, class: className, label = "Copy code" }) => {
    const copied = useSignal(0);

    return (
      <button
        type="button"
        aria-label={copied.value ? "Copied" : label}
        class={[styles.copy, className]}
        data-copied={copied.value > 0}
        onClick$={() => {
          copy(text);
          copied.value++;
          setTimeout(() => copied.value--, 1600);
        }}
      >
        <svg
          class={styles.icon}
          data-icon="copy"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
          aria-hidden="true"
        >
          <path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z" />
        </svg>
        <svg
          class={styles.icon}
          data-icon="check"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
          aria-hidden="true"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </button>
    );
  },
);
