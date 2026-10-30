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
  // The docs of an older line say so under the header.
  const banner = pageVersion !== null && pageVersion !== CURRENT_VERSION;
  const group = DOCS_NAV[version].find((g) => g.items.some((i) => i.href === pathname));
  const editUrl = `${GITHUB_URL}/edit/v2/website/src/routes${pathname}index.tsx`;

  useTask$(({ track }) => {
    track(() => loc.url.pathname);
    navOpen.value = false;
  });

  return (
    <div class={styles.shell} data-banner={banner ? "" : undefined}>
      <a href="#docs-content" class={styles.skip}>
        Skip to content
      </a>
      {/* The banner sticks with the header, so it stays in view. */}
      <div class={styles.top}>
        <DocsHeader version={version} navOpen={navOpen} />
        {banner ? <VersionBanner version={pageVersion} /> : null}
      </div>
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
