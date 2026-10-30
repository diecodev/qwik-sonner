import { component$ } from "@qwik.dev/core";
import { Link } from "@qwik.dev/router";
import { GITHUB_URL } from "~/lib/versions";
import styles from "./footer.module.css";

export const Footer = component$(() => {
  return (
    <footer class={styles.wrapper}>
      <div class={["container", styles.inner]}>
        <p class={styles.p}>
          Made by{" "}
          <a href="https://twitter.com/diecodev" target="_blank" rel="noreferrer">
            diecodev
          </a>
          , inspired by{" "}
          <a href="https://sonner.emilkowal.ski/" target="_blank" rel="noreferrer">
            sonner
          </a>
          .
        </p>
        <nav class={styles.links}>
          <Link href="/docs/changelog/">Changelog</Link>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            <span class="sr-only">GitHub repository</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              width="16"
              height="16"
              aria-hidden="true"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
        </nav>
      </div>
    </footer>
  );
});
