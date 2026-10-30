import { $, component$, useOnDocument, useSignal, useStyles$ } from "@qwik.dev/core";
import { Link, useLocation } from "@qwik.dev/router";
import { toast } from "qwik-sonner";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { CHANGELOG_HREF } from "~/lib/docs-nav";
import { CURRENT_VERSION, GITHUB_URL, VERSIONS } from "~/lib/versions";
import landing from "~/routes/landing.css?inline";
import styles from "./not-found.module.css";

const LINKS = [
  {
    href: `${VERSIONS[CURRENT_VERSION].basePath}/`,
    title: "Documentation",
    text: `The ${VERSIONS[CURRENT_VERSION].qwik} docs`,
  },
  { href: `${VERSIONS.v1.basePath}/`, title: "v1 docs", text: "For Qwik 1 apps" },
  { href: CHANGELOG_HREF, title: "Changelog", text: "Every release, newest first" },
  { href: "/", title: "Home", text: "Demos and quick start" },
];

/**
 * The 404 page. Static hosting serves it (dist/404.html) for any missing
 * address, so the address is only known in the browser: `prerendered` marks
 * that copy, whose router location isn't the visitor's.
 */
export const NotFound = component$<{ prerendered?: boolean }>(({ prerendered }) => {
  useStyles$(landing);
  const loc = useLocation();
  // Reached through client-side navigation the router knows the path; the
  // prerendered copy asks the browser once Qwik starts.
  const path = useSignal(prerendered ? "" : loc.url.pathname);

  useOnDocument(
    "qinit",
    $(() => {
      path.value = location.pathname;
    }),
  );

  const issueUrl = `${GITHUB_URL}/issues/new?title=${encodeURIComponent(
    `Broken link: ${path.value || "(unknown page)"}`,
  )}`;

  return (
    <div class="landing">
      <header class="landing-nav container">
        <Logo />
        <nav>
          <ThemeToggle />
        </nav>
      </header>

      <main class={["container", styles.main]}>
        {/* A sonner error toast, standing in for the page. */}
        <div class={styles.stack} aria-hidden="true">
          <div class={styles.ghost} />
          <div class={styles.ghost} />
          <div class={styles.toast}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd"
              />
            </svg>
            <div class={styles.toastContent}>
              <span class={styles.toastTitle}>Page not found</span>
              <span class={styles.toastPath}>{path.value || "…"}</span>
            </div>
            <Link href="/" class={styles.toastAction} tabIndex={-1}>
              Home
            </Link>
          </div>
        </div>

        <p class={styles.code}>404</p>
        <h1 class={styles.title}>This page doesn't exist</h1>
        <p class={styles.lead}>
          It may have moved when the docs were split into versions. One of these should have what
          you're looking for.
        </p>

        <nav class={styles.links} aria-label="Pages">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} class={styles.link}>
              <strong>{link.title}</strong>
              <span>{link.text}</span>
            </Link>
          ))}
        </nav>

        <div class={styles.footer}>
          <button
            class="button"
            onClick$={() =>
              toast.error("Page not found", {
                description: path.value || undefined,
                action: {
                  label: "Home",
                  onClick$: $(() => {
                    location.href = "/";
                  }),
                },
              })
            }
          >
            Render it as a toast
          </button>
          <a class={styles.report} href={issueUrl} target="_blank" rel="noreferrer">
            Followed a broken link? Report it
          </a>
        </div>
      </main>
    </div>
  );
});
