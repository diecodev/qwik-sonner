import type { Releases } from "./github";

// The notes of each GitHub release: vite.config.ts reads them when the site builds and defines `__RELEASES__` with
// them. A module of its own, so only the changelog carries them.

declare const __RELEASES__: Releases;

export const RELEASES: Releases = __RELEASES__;
