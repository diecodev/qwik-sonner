import { component$ } from "@qwik.dev/core";
import { Link } from "@qwik.dev/router";
import styles from "./logo.module.css";

/** Wordmark with three stacked toasts — the stacking that defines sonner. */
export const Logo = component$(() => (
  <Link href="/" class={styles.logo} aria-label="qwik-sonner home">
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" class={styles.mark}>
      <rect x="5" y="4" width="14" height="5" rx="2" opacity="0.35" />
      <rect x="3.5" y="8" width="17" height="5.5" rx="2" opacity="0.6" />
      <rect x="2" y="12.5" width="20" height="7.5" rx="2.5" />
    </svg>
    <span>qwik-sonner</span>
  </Link>
));
