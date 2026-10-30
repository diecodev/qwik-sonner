import { component$, useSignal } from "@qwik.dev/core";
import { Link, type DocumentHead } from "@qwik.dev/router";
import type { ChangeKind, Releases } from "~/lib/github";
import { majorOf, newestFirst, NPM, tagsOf } from "~/lib/release";
import { GITHUB_URL, NPM_URL } from "~/lib/versions";
import styles from "../pages.module.css";

const FILTERS = [
  { id: "all", label: "All" },
  { id: 2, label: "2.x · Qwik 2" },
  { id: 1, label: "1.x · Qwik 1" },
  { id: 0, label: "0.x" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];

// The kinds the notes are colored by (see lib/github.ts); performance and docs
// sections stay gray.
const LEGEND: { kind: ChangeKind; label: string }[] = [
  { kind: "breaking", label: "Breaking change" },
  { kind: "feature", label: "Feature" },
  { kind: "fix", label: "Fix" },
  { kind: "deprecated", label: "Deprecated" },
];

// The notes of each GitHub release: vite.config.ts reads them when the site
// builds and defines `__RELEASES__` with them, so only this page carries them.
declare const __RELEASES__: Releases;
const RELEASES: Releases = __RELEASES__;

// Every version on npm, newest first, with its notes from the GitHub release
// of its tag; versions, tags and days come from npm. Built when the page
// renders, not when the module loads: in the client build Rolldown can put the
// modules this reads in a chunk that imports this one back, and a module-level
// read would run before they're initialized (an empty page after a <Link>).
const versionsOf = () =>
  Object.keys(NPM.dates)
    .sort(newestFirst)
    .map((version, index, all) => {
      const major = majorOf(version);
      return {
        version,
        major,
        date: NPM.dates[version],
        tags: tagsOf(NPM, version),
        notes: RELEASES[version] ?? null,
        /** the version before it, for the commits between both */
        previous: all[index + 1] ?? null,
        /** the newest version of its major carries the link to that major's docs */
        newestOfMajor: all.findIndex((other) => majorOf(other) === major) === index,
      };
    });

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

export default component$(() => {
  const filter = useSignal<Filter>("all");

  const versions = versionsOf();
  const visible = versions.filter((v) => filter.value === "all" || v.major === filter.value);

  return (
    <>
      <h1>Changelog</h1>
      <p class="lead">
        Every version of qwik-sonner, newest first. Versions, dist-tags and dates come straight from{" "}
        <a href={NPM_URL} target="_blank" rel="noreferrer">
          npm
        </a>
        ; the notes are the{" "}
        <a href={`${GITHUB_URL}/releases`} target="_blank" rel="noreferrer">
          GitHub releases
        </a>
        .
      </p>

      <div class={styles.filters} role="group" aria-label="Filter by major version">
        {FILTERS.map((f) => (
          <button
            key={String(f.id)}
            type="button"
            class="button"
            data-active={filter.value === f.id}
            aria-pressed={filter.value === f.id}
            onClick$={() => (filter.value = f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div class={styles.legend} role="list" aria-label="Kinds of change">
        {LEGEND.map(({ kind, label }) => (
          <span key={kind} class={styles.legendItem} data-kind={kind} role="listitem">
            {label}
          </span>
        ))}
      </div>

      {versions.length === 0 ? (
        <p class={styles.noNotes}>
          npm couldn't be read when this page was built, so there are no versions to show.
        </p>
      ) : null}

      {visible.map((release) => (
        <section key={release.version} id={`v${release.version}`} class={styles.release}>
          <div class={styles.releaseAside}>
            <time dateTime={release.date}>{formatDate(release.date)}</time>
            <span>{release.major >= 2 ? "Qwik 2" : "Qwik 1"}</span>
          </div>
          <div>
            <h2 class={styles.releaseTitle}>
              <a href={`#v${release.version}`} style={{ textDecoration: "none" }}>
                {release.version}
              </a>
              {release.tags.map((tag) => (
                <span
                  key={tag}
                  class={styles.chip}
                  data-tone={tag === "latest" ? "success" : "info"}
                >
                  {tag}
                </span>
              ))}
            </h2>
            {release.notes?.html ? (
              // rendered and sanitized by GitHub (see lib/github.ts)
              <div class={styles.notes} dangerouslySetInnerHTML={release.notes.html} />
            ) : (
              <p class={styles.noNotes}>No release notes for this version.</p>
            )}
            <div class={styles.releaseLinks}>
              <a href={`${NPM_URL}/v/${release.version}`} target="_blank" rel="noreferrer">
                npm
              </a>
              {release.notes ? (
                <a href={release.notes.url} target="_blank" rel="noreferrer">
                  GitHub release
                </a>
              ) : null}
              <a
                href={
                  release.previous
                    ? `${GITHUB_URL}/compare/v${release.previous}...v${release.version}`
                    : `${GITHUB_URL}/tree/v${release.version}`
                }
                target="_blank"
                rel="noreferrer"
              >
                {release.previous ? "Commits" : "Source"}
              </a>
              {!release.newestOfMajor ? null : release.major >= 2 ? (
                <Link href="/docs/migration/">Migration guide</Link>
              ) : release.major === 1 ? (
                <Link href="/docs/v1/">v1 docs</Link>
              ) : null}
            </div>
          </div>
        </section>
      ))}
    </>
  );
});

export const head: DocumentHead = {
  title: "Changelog — qwik-sonner",
  meta: [
    {
      name: "description",
      content:
        "Release notes for every qwik-sonner version, from its GitHub release, with dates from npm.",
    },
  ],
};
