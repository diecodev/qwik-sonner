import { toast } from "qwik-sonner";

import styles from "./hero.module.css";

export const Hero = () => {
  return (
    <div class={styles.wrapper}>
      <div class={styles.toastWrapper}>
        <div class={styles.toast} />
        <div class={styles.toast} />
        <div class={styles.toast} />
      </div>
      <h1 class={styles.heading}>Qwik Sonner</h1>
      <p style={{ marginTop: 0, fontSize: 18 }}>
        An opinionated toast component for Qwik.
      </p>
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
        <a
          class={styles.button}
          href="https://github.com/emilkowalski/sonner"
          target="_blank"
        >
          GitHub
        </a>
      </div>
    </div>
  );
};
