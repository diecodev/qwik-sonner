import { VERSIONS, type VersionId } from "./versions";

export interface NavItem {
  title: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const CHANGELOG_HREF = "/docs/changelog/";

const page = (version: VersionId, slug: string, title: string): NavItem => ({
  title,
  href: `${VERSIONS[version].basePath}/${slug ? `${slug}/` : ""}`,
});

export const DOCS_NAV: Record<VersionId, NavGroup[]> = {
  v2: [
    {
      title: "Getting started",
      items: [page("v2", "", "Introduction"), page("v2", "migration", "Migrating from v1")],
    },
    {
      title: "API reference",
      items: [
        page("v2", "toast", "toast()"),
        page("v2", "toaster", "<Toaster />"),
        page("v2", "options", "Toast options"),
      ],
    },
    {
      title: "Guides",
      items: [
        page("v2", "examples", "Examples"),
        page("v2", "styling", "Styling"),
        page("v2", "advanced", "Advanced"),
      ],
    },
    { title: "Project", items: [{ title: "Changelog", href: CHANGELOG_HREF }] },
  ],
  v1: [
    { title: "Getting started", items: [page("v1", "", "Introduction")] },
    { title: "API reference", items: [page("v1", "api", "API")] },
    { title: "Guides", items: [page("v1", "styling", "Styling")] },
    { title: "Project", items: [{ title: "Changelog", href: CHANGELOG_HREF }] },
  ],
};

// Pages with no same-named counterpart map to their closest match when the
// version selector switches lines; anything unlisted falls back to the root.
const EQUIVALENT_SLUG: Record<VersionId, Record<string, string>> = {
  v1: { toast: "api", toaster: "api", options: "api", styling: "styling" },
  v2: { api: "toast", styling: "styling" },
};

/** URL of the page in `target` that best matches `pathname`. */
export const equivalentHref = (pathname: string, target: VersionId) => {
  const match = /^\/docs\/v\d+\/([^/]+)?/.exec(pathname);
  const slug = match?.[1] ?? "";
  const mapped = EQUIVALENT_SLUG[target][slug] ?? "";
  return `${VERSIONS[target].basePath}/${mapped ? `${mapped}/` : ""}`;
};

/** Previous/next pages within a version, in sidebar order. */
export const pagerFor = (pathname: string, version: VersionId) => {
  const flat = DOCS_NAV[version].flatMap((g) => g.items);
  const index = flat.findIndex((item) => item.href === pathname);
  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index >= 0 && index < flat.length - 1 ? flat[index + 1] : null,
  };
};
