import { lineOf, type Npm } from "./npm";

// The versions the site shows: vite.config.ts reads npm when the site builds and defines `__NPM__` with it, so they
// reach the server and the browser as constants.

export { majorOf, newestFirst, tagsOf, type Line } from "./npm";

declare const __NPM__: Npm;

export const NPM: Npm = __NPM__;
/** the 2.x line, for Qwik 2 */
export const V2 = lineOf(NPM, 2);
/** the 1.x line, for Qwik 1 */
export const V1 = lineOf(NPM, 1);
/** what a plain `npm install qwik-sonner` resolves to, `null` offline */
export const LATEST: string | null = NPM.tags.latest ?? null;
