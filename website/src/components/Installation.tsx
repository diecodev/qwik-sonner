import { component$ } from "@qwik.dev/core";
import { Link } from "@qwik.dev/router";
import { VERSIONS } from "~/lib/versions";
import { CopyButton } from "./CopyButton";
import styles from "./installation.module.css";

export const Installation = component$(() => {
  const command = `npm install ${VERSIONS.v2.spec}`;

  return (
    <div>
      <h2>Installation</h2>
      <div class={styles.code}>
        <code>{command}</code>
        <CopyButton text={command} label="Copy install command" class={styles.copy} />
      </div>
      <p class={styles.note}>
        For Qwik 2. On Qwik 1? Use <code>{VERSIONS.v1.spec}</code> —{" "}
        <Link href="/docs/v1/">v1 docs</Link>.
      </p>
    </div>
  );
});
