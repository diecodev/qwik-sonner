// What npm knows of qwik-sonner: its dist-tags and the day each version came out. vite.config.ts reads it when the
// site builds, so the version menu, the install commands, the badge and the changelog show what's published.
// Plain functions, no Vite globals: vite.config.ts runs them in Node.

export interface Npm {
  /** the library's version in the repo: the one being released, before npm has it */
  version: string;
  /** the dist-tags: `{ latest: "1.0.3", beta: "2.0.0-beta.1" }` */
  tags: Record<string, string>;
  /** the day each published version came out, `YYYY-MM-DD` (UTC) */
  dates: Record<string, string>;
}

const REGISTRY = "https://registry.npmjs.org/qwik-sonner";

/**
 * Reads the registry. Offline, a local build goes on with the repo's version as unreleased; in CI (`CI` is set) it
 * fails, so a deploy never shows versions that aren't the published ones.
 */
export const readNpm = async (version: string): Promise<Npm> => {
  try {
    const response = await fetch(REGISTRY, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const data = (await response.json()) as {
      "dist-tags": Record<string, string>;
      time: Record<string, string>;
    };
    const dates = Object.fromEntries(
      Object.entries(data.time)
        .filter(([key]) => key !== "created" && key !== "modified")
        .map(([key, time]) => [key, time.slice(0, 10)]),
    );
    return { version, tags: data["dist-tags"], dates };
  } catch (error) {
    if (process.env.CI) throw new Error(`couldn't read ${REGISTRY}: ${error}`);
    console.warn(`couldn't read ${REGISTRY} (${error}): the site shows ${version} as unreleased`);
    return { version, tags: {}, dates: {} };
  }
};

const parts = (version: string) => {
  const dash = version.indexOf("-");
  return {
    core: (dash < 0 ? version : version.slice(0, dash)).split(".").map(Number),
    pre: dash < 0 ? [] : version.slice(dash + 1).split("."),
  };
};

export const majorOf = (version: string) => parts(version).core[0];

/** Semver order, newest first: `2.0.0` > `2.0.0-rc.1` > `2.0.0-beta.10` > `2.0.0-beta.2` > `1.0.3`. */
export const newestFirst = (a: string, b: string) => {
  const x = parts(a);
  const y = parts(b);
  for (let i = 0; i < 3; i++) if (x.core[i] !== y.core[i]) return y.core[i] - x.core[i];
  // a release comes after its prereleases
  if (!x.pre.length || !y.pre.length) return x.pre.length - y.pre.length;
  for (let i = 0; i < Math.max(x.pre.length, y.pre.length); i++) {
    const [p, q] = [x.pre[i], y.pre[i]];
    if (p === undefined || q === undefined) return p === undefined ? 1 : -1;
    if (p === q) continue;
    const numeric = /^\d+$/.test(p) && /^\d+$/.test(q);
    return numeric ? Number(q) - Number(p) : q < p ? -1 : 1;
  }
  return 0;
};

/** Every dist-tag pointing at `version`. */
export const tagsOf = (npm: Npm, version: string) =>
  Object.entries(npm.tags)
    .filter(([, tagged]) => tagged === version)
    .map(([tag]) => tag);

/** A major of qwik-sonner, as the site names it. */
export interface Line {
  major: number;
  /** the newest stable version of the major on npm, else its newest prerelease, else the repo's own */
  version: string;
  /** the dist-tag of `version`: `beta`, `latest`… */
  tag: string | null;
  /** the day `version` came out, `null` while it isn't on npm */
  date: string | null;
  /** no stable version yet: only alphas, betas, release candidates */
  prerelease: boolean;
  /** what to install: `qwik-sonner` once `latest` is the newest major, `qwik-sonner@beta` or `qwik-sonner@1` otherwise */
  spec: string;
}

export const lineOf = (npm: Npm, major: number): Line => {
  const published = Object.keys(npm.dates)
    .filter((version) => majorOf(version) === major)
    .sort(newestFirst);
  const stable = published.find((version) => !version.includes("-"));
  // an older major npm didn't answer for (offline): stable, by its number
  if (!published.length && majorOf(npm.version) !== major) {
    return {
      major,
      version: `${major}.0.0`,
      tag: null,
      date: null,
      prerelease: false,
      spec: `qwik-sonner@${major}`,
    };
  }
  // before its first publish, the repo's version stands for its major
  const version = stable ?? published[0] ?? npm.version;
  const tag = tagsOf(npm, version)[0] ?? null;
  const base = { major, version, tag, date: npm.dates[version] ?? null };

  if (stable) {
    // the plain package name installs `latest`: only for the newest major
    const plain =
      npm.tags.latest !== undefined &&
      majorOf(npm.tags.latest) === major &&
      majorOf(npm.version) === major;
    return { ...base, prerelease: false, spec: plain ? "qwik-sonner" : `qwik-sonner@${major}` };
  }
  // only prereleases: their dist-tag, or the identifier of the version (`beta` in 2.0.0-beta.1) before it's tagged
  const name = tag ?? parts(version).pre[0] ?? "next";
  return { ...base, prerelease: true, spec: `qwik-sonner@${name}` };
};

/** A section of the changelog: a `major.minor` series and its versions on npm. */
export interface Series {
  major: number;
  minor: number;
  /** the newest version of the series on npm, or the repo's (or `major.minor.0`) before any */
  version: string;
  /** dist-tags pointing at `version` */
  tags: string[];
  /** the day it came out, `null` while it isn't on npm */
  date: string | null;
  /** the other versions of the series, newest first */
  earlier: { version: string; date: string }[];
}

export const seriesOf = (npm: Npm, major: number, minor: number): Series => {
  const inSeries = (version: string) => {
    const [x, y] = parts(version).core;
    return x === major && y === minor;
  };
  const published = Object.keys(npm.dates).filter(inSeries).sort(newestFirst);
  const version = published[0] ?? (inSeries(npm.version) ? npm.version : `${major}.${minor}.0`);
  return {
    major,
    minor,
    version,
    tags: tagsOf(npm, version),
    date: npm.dates[version] ?? null,
    earlier: published.slice(1).map((other) => ({ version: other, date: npm.dates[other] })),
  };
};

/** Every `major.minor` series on npm plus the repo's, newest first: `["2.0", "1.0", "0.4", …]`. */
export const seriesKeys = (npm: Npm) => {
  const keys = new Set(
    [...Object.keys(npm.dates), npm.version].map((v) => parts(v).core.slice(0, 2).join(".")),
  );
  return [...keys].sort((a, b) => newestFirst(`${a}.0`, `${b}.0`));
};
