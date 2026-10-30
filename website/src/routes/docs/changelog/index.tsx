import { component$, useSignal } from "@qwik.dev/core";
import { Link, type DocumentHead } from "@qwik.dev/router";
import { inline } from "~/components/docs/inline";
import { KIND_LABEL, NOTES, type ChangeKind } from "~/lib/changelog";
import { NPM, seriesKeys, seriesOf } from "~/lib/release";
import { GITHUB_URL, NPM_URL } from "~/lib/versions";
import styles from "../pages.module.css";

const KIND_ORDER: ChangeKind[] = ["breaking", "feature", "fix", "deprecated", "docs"];

const FILTERS = [
  { id: "all", label: "All" },
  { id: 2, label: "2.x · Qwik 2" },
  { id: 1, label: "1.x · Qwik 1" },
  { id: 0, label: "0.x" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];

// Every series npm knows (plus the repo's, before it's published) and every
// series with notes, newest first; versions, tags and days come from npm.
const SERIES = [...new Set([...seriesKeys(NPM), ...NOTES.map((n) => n.series)])]
  .sort((a, b) => {
    const [am, an] = a.split(".").map(Number);
    const [bm, bn] = b.split(".").map(Number);
    return bm - am || bn - an;
  })
  .map((key) => {
    const [major, minor] = key.split(".").map(Number);
    return { key, ...seriesOf(NPM, major, minor), notes: NOTES.find((n) => n.series === key) };
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

  const visible = SERIES.filter((s) => filter.value === "all" || s.major === filter.value);

  return (
    <>
      <h1>Changelog</h1>
      <p class="lead">
        Every release line of qwik-sonner, newest first. Versions, dist-tags and dates come straight
        from{" "}
        <a href={NPM_URL} target="_blank" rel="noreferrer">
          npm
        </a>
        ; releases are tagged on{" "}
        <a href={`${GITHUB_URL}/tags`} target="_blank" rel="noreferrer">
          GitHub
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

      {visible.map((series) => {
        const index = SERIES.indexOf(series);
        const previous = SERIES.slice(index + 1).find((s) => s.date !== null);
        const notes = series.notes;
        const kinds = KIND_ORDER.filter((k) => notes?.changes.some((c) => c.kind === k));

        return (
          <section key={series.key} id={`v${series.key}`} class={styles.release}>
            <div class={styles.releaseAside}>
              {series.date ? (
                <time dateTime={series.date}>{formatDate(series.date)}</time>
              ) : (
                <span>Unreleased</span>
              )}
              <span>{series.major >= 2 ? "Qwik 2" : "Qwik 1"}</span>
            </div>
            <div>
              <h2 class={styles.releaseTitle}>
                <a href={`#v${series.key}`} style={{ textDecoration: "none" }}>
                  {series.version}
                </a>
                {series.tags.map((tag) => (
                  <span
                    key={tag}
                    class={styles.chip}
                    data-tone={tag === "latest" ? "success" : "info"}
                  >
                    {tag}
                  </span>
                ))}
                {series.date === null ? <span class={styles.chip}>unreleased</span> : null}
              </h2>
              {notes?.summary ? <p>{inline(notes.summary)}</p> : null}
              {kinds.length ? (
                <ul class={styles.changes}>
                  {kinds.flatMap((kind) =>
                    notes!.changes
                      .filter((c) => c.kind === kind)
                      .map((change, i) => (
                        <li key={`${kind}-${i}`}>
                          <span class={styles.kind} data-kind={kind}>
                            {KIND_LABEL[kind]}
                          </span>
                          <span>
                            {inline(change.text)}
                            {change.version && series.earlier.length ? (
                              <span class={styles.since}>{change.version}</span>
                            ) : null}
                          </span>
                        </li>
                      )),
                  )}
                </ul>
              ) : (
                <p class={styles.noNotes}>No release notes for this series yet.</p>
              )}
              {series.earlier.length ? (
                <p class={styles.earlier}>
                  Earlier in {series.key}:{" "}
                  {series.earlier.map(({ version, date }, i) => (
                    <span key={version}>
                      {i > 0 ? " · " : null}
                      <a href={`${NPM_URL}/v/${version}`} target="_blank" rel="noreferrer">
                        {version}
                      </a>{" "}
                      ({formatDate(date)})
                    </span>
                  ))}
                </p>
              ) : null}
              <div class={styles.releaseLinks}>
                {series.date ? (
                  <a href={`${NPM_URL}/v/${series.version}`} target="_blank" rel="noreferrer">
                    npm
                  </a>
                ) : null}
                {series.date ? (
                  <a
                    href={
                      previous
                        ? `${GITHUB_URL}/compare/v${previous.version}...v${series.version}`
                        : `${GITHUB_URL}/tree/v${series.version}`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    {previous ? "Commits" : "Source"}
                  </a>
                ) : null}
                {series.major >= 2 ? (
                  <Link href="/docs/v2/migration/">Migration guide</Link>
                ) : series.major === 1 ? (
                  <Link href="/docs/v1/">v1 docs</Link>
                ) : null}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
});

export const head: DocumentHead = {
  title: "Changelog — qwik-sonner",
  meta: [
    {
      name: "description",
      content: "Release notes for every qwik-sonner series, with versions and dates from npm.",
    },
  ],
};
