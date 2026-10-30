// The release notes of qwik-sonner: the body of each published GitHub release, as GitHub renders it. vite.config.ts
// reads them when the site builds, next to npm.ts, so the changelog shows what each release says.
// Plain functions, no Vite globals: vite.config.ts runs them in Node.

export interface ReleaseNotes {
  /** the notes as HTML, rendered and sanitized by GitHub; empty when the release has none */
  html: string;
  /** the release's page on GitHub */
  url: string;
}

/** The notes of each published release, by version (the tag without its `v`). */
export type Releases = Record<string, ReleaseNotes>;

/** The kinds of change a release's sections list, as the changelog colors them. */
export type ChangeKind = "breaking" | "deprecated" | "feature" | "fix" | "perf" | "docs";

// A section's kind, from its heading: the curated notes say "Breaking changes",
// "Features", "Fixes"…, changelogithub "🚨 Breaking Changes", "🚀 Features",
// "🐞 Bug Fixes", "🏎 Performance". The first match wins.
const KINDS: [ChangeKind, RegExp][] = [
  ["breaking", /breaking/i],
  ["deprecated", /deprecat/i],
  ["feature", /feature|\bnew\b|\badded\b/i],
  ["fix", /\bfix/i],
  ["perf", /perf/i],
  ["docs", /\bdocs?\b|documentation/i],
];

/**
 * Marks each heading of a known kind, and the lists under it until the next
 * heading, with `data-kind` so the changelog can color them. Other headings
 * ("View changes on GitHub") and the lists under them stay as they are.
 */
export const markKinds = (html: string) => {
  let kind: ChangeKind | undefined;
  return html.replace(
    /<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>|<ul(?=[\s>])/g,
    (match, tag?: string, attrs?: string, inner?: string) => {
      if (!tag) return kind ? `<ul data-kind="${kind}"` : match;
      const text = inner!.replace(/<[^>]*>/g, "").replace(/&[#\w]+;/g, " ");
      kind = KINDS.find(([, pattern]) => pattern.test(text))?.[0];
      return kind ? `<${tag}${attrs} data-kind="${kind}">${inner}</${tag}>` : match;
    },
  );
};

const RELEASES = "https://api.github.com/repos/diecodev/qwik-sonner/releases";
const PER_PAGE = 100;

interface GitHubRelease {
  tag_name: string;
  draft: boolean;
  html_url: string;
  body_html?: string | null;
}

const readPage = async (page: number): Promise<GitHubRelease[]> => {
  const headers: Record<string, string> = {
    // `body_html`: the body as GitHub renders it on the release page
    Accept: "application/vnd.github.html+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "qwik-sonner-website",
  };
  // without a token GitHub allows 60 requests an hour per address, shared by every build on it
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`${RELEASES}?per_page=${PER_PAGE}&page=${page}`, {
    headers,
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return (await response.json()) as GitHubRelease[];
};

/**
 * Reads the published releases (drafts wait for the approval on npm, see CONTRIBUTING.md). Offline or rate-limited,
 * a local or preview build goes on without notes; in GitHub Actions (production deploys and the CI) it fails, so a
 * deploy never drops the notes.
 */
export const readReleases = async (): Promise<Releases> => {
  try {
    const releases: GitHubRelease[] = [];
    for (let page = 1; ; page++) {
      const batch = await readPage(page);
      releases.push(...batch);
      if (batch.length < PER_PAGE) break;
    }
    return Object.fromEntries(
      releases
        .filter((release) => !release.draft && release.tag_name.startsWith("v"))
        .map((release) => [
          release.tag_name.slice(1),
          { html: markKinds(release.body_html?.trim() ?? ""), url: release.html_url },
        ]),
    );
  } catch (error) {
    if (process.env.GITHUB_ACTIONS) throw new Error(`couldn't read ${RELEASES}: ${error}`);
    console.warn(`couldn't read ${RELEASES} (${error}): the changelog shows no release notes`);
    return {};
  }
};
