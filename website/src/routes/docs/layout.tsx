import { component$, Slot, useSignal, useTask$ } from "@qwik.dev/core";
import { useDocumentHead, useLocation } from "@qwik.dev/router";
import {
  DocsHeader,
  Pager,
  Sidebar,
  Toc,
  VersionBanner,
  type TocItem,
} from "~/components/docs/chrome";
import { DOCS_NAV } from "~/lib/docs-nav";
import { CURRENT_VERSION, GITHUB_URL, versionFromPath } from "~/lib/versions";
import styles from "./docs.module.css";

export default component$(() => {
  const loc = useLocation();
  const head = useDocumentHead<{ toc?: TocItem[] }>();
  const navOpen = useSignal(false);

  const pathname = loc.url.pathname;
  const pageVersion = versionFromPath(pathname);
  // Unversioned pages (the changelog) borrow the current version's navigation.
  const version = pageVersion ?? CURRENT_VERSION;
  const group = DOCS_NAV[version].find((g) => g.items.some((i) => i.href === pathname));
  const editUrl = `${GITHUB_URL}/edit/v2/website/src/routes${pathname}index.tsx`;

  useTask$(({ track }) => {
    track(() => loc.url.pathname);
    navOpen.value = false;
  });

  return (
    <div class={styles.shell}>
      <a href="#docs-content" class={styles.skip}>
        Skip to content
      </a>
      <DocsHeader version={version} navOpen={navOpen} />
      {pageVersion ? <VersionBanner version={pageVersion} /> : null}
      <div class={styles.grid}>
        <Sidebar version={version} open={navOpen.value} />
        <main id="docs-content" class={styles.main}>
          {group ? <span class={styles.eyebrow}>{group.title}</span> : null}
          <article class={styles.prose}>
            <Slot />
          </article>
          {pageVersion ? <Pager version={pageVersion} /> : null}
          <footer class={styles.pageFooter}>
            <a href={editUrl} target="_blank" rel="noreferrer">
              Edit this page on GitHub
            </a>
            <span>
              MIT License · Made by{" "}
              <a href="https://github.com/diecodev" target="_blank" rel="noreferrer">
                diecodev
              </a>
            </span>
          </footer>
        </main>
        <Toc items={head.frontmatter.toc ?? []} />
      </div>
    </div>
  );
});
