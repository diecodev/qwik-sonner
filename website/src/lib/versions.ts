import { V1, V2, type Line } from "./release";

export type VersionId = "v2" | "v1";

/** A docs line: a major on npm (see `lineOf`) plus what the docs say about it. */
export interface DocsVersion extends Line {
  id: VersionId;
  /** Qwik generation this line of releases targets. */
  qwik: string;
  qwikPackage: string;
  /** `legacy` for any line older than the current docs. */
  status: "stable" | "prerelease" | "legacy";
  /** Text of the status pill: `Stable`, the dist-tag (`beta`, `rc`) or `Legacy`. */
  statusLabel: string;
  /** `/docs` for the current line, `/docs/v1` for an older one */
  basePath: "/docs" | `/docs/${VersionId}`;
}

/**
 * Newest docs line: its pages live at `/docs/…` (routes/docs/), the older lines' at `/docs/v<n>/…`
 * (routes/docs/v<n>/), and vercel.json sends `/docs/v<n>/…` of the current line to `/docs/…`. When a
 * new major ships, move the current pages to routes/docs/v<n>/ and the new ones to routes/docs/.
 */
export const CURRENT_VERSION: VersionId = "v2";

export const VERSION_ORDER: VersionId[] = ["v2", "v1"];

const docsVersion = (id: VersionId, line: Line, qwik: string, qwikPackage: string): DocsVersion => {
  const status = id !== CURRENT_VERSION ? "legacy" : line.prerelease ? "prerelease" : "stable";
  return {
    ...line,
    id,
    qwik,
    qwikPackage,
    status,
    statusLabel:
      status === "legacy" ? "Legacy" : status === "stable" ? "Stable" : (line.tag ?? "Pre-release"),
    basePath: id === CURRENT_VERSION ? "/docs" : `/docs/${id}`,
  };
};

// Versions, dist-tags and install commands all come from npm (see release.ts).
export const VERSIONS: Record<VersionId, DocsVersion> = {
  v2: docsVersion("v2", V2, "Qwik 2", "@qwik.dev/core"),
  v1: docsVersion("v1", V1, "Qwik 1", "@builder.io/qwik"),
};

/** The docs line a page belongs to; `null` for pages of none (the changelog) and outside the docs. */
export const versionFromPath = (pathname: string): VersionId | null => {
  const match = /^\/docs\/(v\d+)(\/|$)/.exec(pathname);
  if (match) return match[1] in VERSIONS ? (match[1] as VersionId) : null;
  return /^\/docs(\/|$)/.test(pathname) && !pathname.startsWith("/docs/changelog")
    ? CURRENT_VERSION
    : null;
};

export const GITHUB_URL = "https://github.com/diecodev/qwik-sonner";
export const NPM_URL = "https://www.npmjs.com/package/qwik-sonner";
