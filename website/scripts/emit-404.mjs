// Runs after the SSG (`pnpm build.server`). Qwik Router 2.0.0-beta.37 prerenders
// index routes only, so the 404 page is rendered at /not-found/; this moves it to
// dist/404.html, which Vercel serves for every missing address, and drops the
// /not-found/ page from the output and the sitemap.
import { copyFile, readFile, rm, writeFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);

await copyFile(new URL("not-found/index.html", dist), new URL("404.html", dist));
await rm(new URL("not-found/", dist), { recursive: true });

const sitemap = new URL("sitemap.xml", dist);
const xml = await readFile(sitemap, "utf8");
await writeFile(sitemap, xml.replace(/<url><loc>[^<]*\/not-found\/<\/loc><\/url>\n?/g, ""));

console.log("dist/404.html written");
