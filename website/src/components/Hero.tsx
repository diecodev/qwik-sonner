import { component$ } from "@qwik.dev/core";
import { Link } from "@qwik.dev/router";
import { toast } from "qwik-sonner";
import { GITHUB_URL } from "~/lib/versions";
import { QwikV2Badge } from "./QwikV2Badge";
import styles from "./hero.module.css";

export const Hero = component$(() => {
  return (
    <div class={styles.wrapper}>
      <QwikV2Badge />
      <div class={styles.toastWrapper} aria-hidden="true">
        <div class={styles.toast} />
        <div class={styles.toast} />
        <div class={styles.toast} />
      </div>
      <h1 class={styles.heading}>Qwik Sonner</h1>
      <p class={styles.subheading}>An opinionated toast component for Qwik.</p>
      <div class={styles.buttons}>
        <button
          data-primary=""
          onClick$={() => {
            toast("Sonner", {
              description: "An opinionated toast component for Qwik.",
            });
          }}
          class={styles.button}
        >
          Render a toast
        </button>
        <Link class={styles.button} href="/docs/v2/">
          Documentation
        </Link>
        <a class={styles.button} href={GITHUB_URL} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </div>
  );
});
