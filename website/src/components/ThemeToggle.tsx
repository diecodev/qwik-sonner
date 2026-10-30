import { $, component$, useOnDocument } from "@qwik.dev/core";
import { useToasterControls } from "~/lib/toaster-context";
import styles from "./theme-toggle.module.css";

type SiteTheme = "light" | "dark";

const currentTheme = (): SiteTheme => {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

/**
 * Site light/dark switch. The icon is pure CSS (it reads `<html data-theme>`
 * and the system preference), so it is right from the first paint; the only
 * script keeps the site-wide Toaster's theme in step.
 */
export const ThemeToggle = component$(() => {
  const controls = useToasterControls();

  // The server can't know the visitor's theme: sync the Toaster once Qwik
  // boots, and follow OS changes while no explicit choice was made.
  useOnDocument(
    "qinit",
    $(() => {
      controls.theme.value = currentTheme();
      matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (!document.documentElement.dataset.theme) controls.theme.value = currentTheme();
      });
    }),
  );

  return (
    <button
      type="button"
      class={styles.toggle}
      aria-label="Toggle dark mode"
      onClick$={() => {
        const next: SiteTheme = currentTheme() === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("theme", next);
        } catch {
          // Storage can be unavailable (private mode); the choice just won't persist.
        }
        controls.theme.value = next;
      }}
    >
      <svg
        class={styles.icon}
        data-icon="sun"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg
        class={styles.icon}
        data-icon="moon"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
});
