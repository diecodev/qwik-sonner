import { component$ } from "@qwik.dev/core";
import { Link } from "@qwik.dev/router";
import { LATEST, majorOf } from "~/lib/release";
import { VERSIONS } from "~/lib/versions";
import styles from "./qwik-v2-badge.module.css";

/**
 * Tells visitors whether a Qwik v2 compatible qwik-sonner (the 2.x line) is on
 * npm and on which channel. npm is read when the site builds, see release.ts.
 */
export const QwikV2Badge = component$<{ size?: "sm" | "md" }>(({ size = "md" }) => {
  const { version, date, prerelease, tag, spec } = VERSIONS.v2;
  const channel = date === null ? "none" : prerelease ? "prerelease" : "stable";
  const latestIsV1 = LATEST !== null && majorOf(LATEST) < 2;

  const label =
    channel === "none" ? "Not published yet" : channel === "prerelease" ? version : `v${version}`;
  const title =
    channel === "none"
      ? "There is no Qwik v2 compatible release of qwik-sonner on npm yet."
      : `qwik-sonner ${version} supports Qwik v2 (@qwik.dev/core). Install it with ${spec}${
          latestIsV1 ? ` — "latest" is still ${LATEST}` : ""
        }.`;

  return (
    <Link
      href="/docs/v2/#installation"
      class={styles.badge}
      data-size={size}
      data-channel={channel}
      title={title}
    >
      <span class={styles.lead}>
        <span class={styles.dot} aria-hidden="true" />
        Qwik v2
      </span>
      <span class={styles.value}>
        {label}
        {channel === "prerelease" && tag ? <span class={styles.tag}>{tag}</span> : null}
      </span>
      <span class="sr-only">{title}</span>
    </Link>
  );
});
