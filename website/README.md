# qwik-sonner website

Demo and docs site for `qwik-sonner`, built with Qwik v2 + [Qwik Router](https://qwik.dev/docs/) and
hosted on [Vercel](https://vercel.com/docs) at <https://qwik-sonner.dieco.dev>.

It consumes the library through `workspace:*`, i.e. from the built `lib/` folder at the repo root,
so **build the library first** (`pnpm build.types && pnpm build.lib` from the root).

## Commands

```shell
pnpm dev            # dev server (SSR)
pnpm build.types    # typecheck
pnpm build.client   # client build -> dist/
pnpm build.server   # prerenders every route into dist/ (SSG), plus 404.html and sitemap.xml
pnpm preview        # production build served locally by Vite
```

From the repo root, `pnpm build.website` runs the whole chain (library + client + SSG), as Vercel does.

## Versions come from npm

The version menu, the install commands, the banners, the Qwik v2 badge and the changelog's versions,
dist-tags and dates are read from the npm registry when the site builds (`vite.config.ts` →
`src/lib/npm.ts` → `src/lib/release.ts`). Only the release notes are written by hand, in
`src/lib/changelog.ts`, per `major.minor` series. Offline, a local build shows the repo's version as
unreleased; in CI (`CI` set) the build fails instead.

## Deployment (Vercel)

The site is fully prerendered, so Vercel serves `dist/` as static files: no functions.

**Production** deploys from GitHub Actions ([`website.yml`](../.github/workflows/website.yml)), which
builds with the Vercel CLI (`vercel build --prod`, then `vercel deploy --prebuilt --prod`):

- after each release, once the new version is on npm (`release.yml` calls it);
- on each push to `v2` that changes `website/` or `vercel.json`;
- by hand (Actions → Website → Run workflow).

It needs three repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`.

**Previews** come from Vercel's Git integration, which builds nothing for `main` or `v2`
(`git.deploymentEnabled`). Its Ignored Build Step, [`scripts/vercel-preview.sh`](./scripts/vercel-preview.sh),
skips every branch that doesn't change `website/` or `vercel.json` compared with `v2`.

> When `v2` merges into `main`, switch the production branch to `main` in `website.yml`,
> `scripts/vercel-preview.sh` and `vercel.json` (`git.deploymentEnabled`).

The build settings live in [`vercel.json`](../vercel.json) at the repo root:

| Setting          | Value                                                |
| ---------------- | ---------------------------------------------------- |
| Root directory   | repo root (the default): the build needs the library |
| Framework preset | none (`"framework": null`)                           |
| Install command  | the default: `pnpm install`                          |
| Build command    | `pnpm build.website`                                 |
| Output directory | `website/dist`                                       |

pnpm is the one in the root `package.json`'s `packageManager`: the CI's setup installs it, and
Vercel reads it for the previews.

`trailingSlash` matches the URLs of the pages (`/docs/v2/toast/`), `/docs` redirects to the current
docs, `404.html` answers missing pages, and `/build/` and `/assets/` (hashed file names) are cached
for a year.
