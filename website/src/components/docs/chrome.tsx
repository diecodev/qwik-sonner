import {
  $,
  component$,
  useOnDocument,
  useOnWindow,
  useSignal,
  useTask$,
  type Signal,
} from "@qwik.dev/core";
import { Link, useLocation } from "@qwik.dev/router";
import { CHANGELOG_HREF, DOCS_NAV, equivalentHref, pagerFor } from "~/lib/docs-nav";
import {
  CURRENT_VERSION,
  GITHUB_URL,
  VERSION_ORDER,
  VERSIONS,
  type VersionId,
} from "~/lib/versions";
import { LATEST, majorOf } from "~/lib/release";
import { Logo } from "../Logo";
import { QwikV2Badge } from "../QwikV2Badge";
import { ThemeToggle } from "../ThemeToggle";
import styles from "./chrome.module.css";

export interface TocItem {
  id: string;
  title: string;
  level?: 2 | 3;
}

/* Version selector -------------------------------------------------------- */

export const VersionSelect = component$<{ current: VersionId }>(({ current }) => {
  const loc = useLocation();
  const open = useSignal(false);
  const root = useSignal<HTMLElement>();

  useOnDocument(
    "click",
    $((event) => {
      if (open.value && !root.value?.contains(event.target as Node)) open.value = false;
    }),
  );
  useOnDocument(
    "keydown",
    $((event) => {
      if (open.value && (event as KeyboardEvent).key === "Escape") open.value = false;
    }),
  );

  return (
    <div ref={root} class={styles.versionSelect}>
      <button
        type="button"
        class={styles.versionTrigger}
        aria-haspopup="menu"
        aria-expanded={open.value}
        aria-label={`Documentation version: ${VERSIONS[current].version}`}
        onClick$={() => (open.value = !open.value)}
      >
        <span class={styles.versionMono}>v{VERSIONS[current].version}</span>
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" class={styles.chevron}>
          <path
            d="M4 6l4 4 4-4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div class={styles.versionMenu} role="menu" data-open={open.value}>
        <span class={styles.menuLabel}>Documentation for</span>
        {VERSION_ORDER.map((id) => {
          const v = VERSIONS[id];
          return (
            <Link
              key={id}
              role="menuitem"
              href={equivalentHref(loc.url.pathname, id)}
              class={styles.versionItem}
              data-active={id === current}
              tabIndex={open.value ? 0 : -1}
              onClick$={() => (open.value = false)}
            >
              <span class={styles.versionMajor}>{id}</span>
              <span class={styles.versionMeta}>
                <span class={styles.versionMono}>{v.version}</span>
                <span class={styles.versionQwik}>
                  {v.qwik} · {v.qwikPackage}
                </span>
              </span>
              <span class={styles.status} data-status={v.status}>
                {v.statusLabel}
              </span>
            </Link>
          );
        })}
        <div class={styles.menuDivider} />
        <Link
          href={CHANGELOG_HREF}
          class={styles.menuLink}
          tabIndex={open.value ? 0 : -1}
          onClick$={() => (open.value = false)}
        >
          Changelog
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
});

/* Header ------------------------------------------------------------------ */

export const DocsHeader = component$<{ version: VersionId; navOpen: Signal<boolean> }>(
  ({ version, navOpen }) => {
    const loc = useLocation();
    const onChangelog = loc.url.pathname.startsWith(CHANGELOG_HREF);

    return (
      <header class={styles.header}>
        <div class={styles.headerInner}>
          <div class={styles.headerLeft}>
            <Logo />
            <span class={styles.slash} aria-hidden="true">
              /
            </span>
            <VersionSelect current={version} />
          </div>
          <nav class={styles.headerNav} aria-label="Site">
            <span class={styles.headerBadge}>
              <QwikV2Badge size="sm" />
            </span>
            <Link
              href={`${VERSIONS[version].basePath}/`}
              class={styles.headerLink}
              data-active={!onChangelog}
            >
              Docs
            </Link>
            <Link href={CHANGELOG_HREF} class={styles.headerLink} data-active={onChangelog}>
              Changelog
            </Link>
            <a href={GITHUB_URL} class={styles.headerIcon} target="_blank" rel="noreferrer">
              <span class="sr-only">GitHub repository</span>
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.36 9.36 0 0 1 12 6.84c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.1 10.1 0 0 0 22 12.23C22 6.58 17.52 2 12 2z" />
              </svg>
            </a>
            <ThemeToggle />
            <button
              type="button"
              class={styles.menuButton}
              aria-expanded={navOpen.value}
              aria-controls="docs-sidebar"
              onClick$={() => (navOpen.value = !navOpen.value)}
            >
              <span class="sr-only">Toggle navigation</span>
              <span class={styles.burger} data-open={navOpen.value} aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </nav>
        </div>
      </header>
    );
  },
);

/* Version banner ---------------------------------------------------------- */

export const VersionBanner = component$<{ version: VersionId }>(({ version }) => {
  const loc = useLocation();
  const v = VERSIONS[version];
  const current = VERSIONS[CURRENT_VERSION];

  if (version !== CURRENT_VERSION) {
    return (
      <div class={styles.banner} data-tone="warning" role="note">
        <p>
          You're reading the docs for <strong>qwik-sonner {v.version}</strong>, the {v.qwik} (
          <code>{v.qwikPackage}</code>) line. It no longer receives new features.
        </p>
        <Link href={equivalentHref(loc.url.pathname, CURRENT_VERSION)} class={styles.bannerLink}>
          Go to the {current.qwik} docs ({CURRENT_VERSION})<span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  if (v.status === "prerelease") {
    // While `latest` is still an older major, say what a plain install gets.
    const olderLatest = LATEST !== null && majorOf(LATEST) < v.major ? LATEST : null;
    return (
      <div class={styles.banner} data-tone="info" role="note">
        <p>
          <strong>
            {CURRENT_VERSION} is in {v.tag ?? "pre-release"} ({v.version}).
          </strong>{" "}
          Install it with <code>{v.spec}</code>
          {olderLatest ? (
            <>
              {" "}
              — plain <code>qwik-sonner</code> still resolves to {olderLatest}
            </>
          ) : null}
          .
        </p>
        <Link href={`${v.basePath}/#installation`} class={styles.bannerLink}>
          Installation
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  return null;
});

/* Sidebar ----------------------------------------------------------------- */

export const Sidebar = component$<{ version: VersionId; open: boolean }>(({ version, open }) => {
  const loc = useLocation();

  return (
    <aside id="docs-sidebar" class={styles.sidebar} data-open={open}>
      <nav aria-label="Documentation">
        {DOCS_NAV[version].map((group) => (
          <div key={group.title} class={styles.navGroup}>
            <span class={styles.navTitle}>{group.title}</span>
            <ul>
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    class={styles.navLink}
                    aria-current={loc.url.pathname === item.href ? "page" : undefined}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
});

/* On this page ------------------------------------------------------------ */

export const Toc = component$<{ items: TocItem[] }>((props) => {
  const active = useSignal<string>("");

  // A new page (the layout, and so this component, persists) starts unhighlighted.
  useTask$(({ track }) => {
    track(() => props.items);
    active.value = "";
  });

  // Highlight the section being read: the last heading above the top third
  // of the viewport. Runs only once the reader scrolls — no code on load.
  useOnWindow(
    "scroll",
    $(() => {
      let current = "";
      for (const item of props.items) {
        const heading = document.getElementById(item.id);
        if (heading && heading.getBoundingClientRect().top < window.innerHeight * 0.33) {
          current = item.id;
        }
      }
      active.value = current;
    }),
  );

  const items = props.items;
  if (!items.length) return null;

  return (
    <nav class={styles.toc} aria-label="On this page">
      <span class={styles.tocTitle}>On this page</span>
      <ul>
        {items.map((item) => (
          <li key={item.id} data-level={item.level ?? 2}>
            <a
              href={`#${item.id}`}
              class={styles.tocLink}
              aria-current={(active.value || items[0].id) === item.id ? "location" : undefined}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
});

/* Prev / next ------------------------------------------------------------- */

export const Pager = component$<{ version: VersionId }>(({ version }) => {
  const loc = useLocation();
  const { prev, next } = pagerFor(loc.url.pathname, version);
  if (!prev && !next) return null;

  return (
    <nav class={styles.pager} aria-label="Pagination">
      {prev ? (
        <Link href={prev.href} class={styles.pagerLink} data-dir="prev">
          <span class={styles.pagerLabel}>Previous</span>
          <span class={styles.pagerTitle}>← {prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} class={styles.pagerLink} data-dir="next">
          <span class={styles.pagerLabel}>Next</span>
          <span class={styles.pagerTitle}>{next.title} →</span>
        </Link>
      ) : null}
    </nav>
  );
});
