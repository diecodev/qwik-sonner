# AGENTS.md — qwik-sonner

Guidance for AI coding agents (Claude Code, Codex, Gemini, Cursor, etc.) working in this
repository. This is the single source of truth; `CLAUDE.md` and `GEMINI.md` point here.

## What this project is

`qwik-sonner` is an opinionated toast component for **Qwik**, ported from
[sonner](https://sonner.emilkowal.ski/) (React). It is a **published npm library**, so changes to
its public API, build output, or `package.json#exports` are user-facing — treat them carefully.

It ships two entry points:

- **Styled** (default): `import { Toaster, toast } from "qwik-sonner";`
- **Headless**: `import { ... } from "qwik-sonner/headless";`

## ⚠️ This project targets Qwik v2 (beta)

The codebase was migrated from Qwik 1.x to **Qwik 2.0 beta** (`@qwik.dev/core` /
`@qwik.dev/router`, `2.0.0-beta.37`). Qwik v2 is still in beta — APIs can shift between betas.
**Do not reintroduce v1 (`@builder.io/*`) packages or imports.**

### v1 → v2 renames (memorize these)

| Qwik v1 | Qwik v2 |
|---|---|
| `@builder.io/qwik` | `@qwik.dev/core` |
| `@builder.io/qwik/optimizer` | `@qwik.dev/core/optimizer` |
| `@builder.io/qwik/server` | `@qwik.dev/core/server` |
| `@builder.io/qwik-city` | `@qwik.dev/router` |
| `@builder.io/qwik-city/vite` → `qwikCity()` | `@qwik.dev/router/vite` → `qwikRouter()` |
| `createQwikCity()` (middleware) | `createQwikRouter()` |
| `<QwikCityProvider>` | `<QwikRouterProvider>` |
| `@qwik-city-plan` (virtual module) | `@qwik-router-config` |
| `jsxImportSource: "@builder.io/qwik"` | `jsxImportSource: "@qwik.dev/core"` |
| `qwikVite()` from `/optimizer` | **unchanged** (still `qwikVite`) |
| `renderToStream`, `renderToString` (`/server`) | **unchanged** |
| `routeLoader$`, `useLocation`, `DocumentHead`, `RequestHandler`, `RouterOutlet` | **unchanged** (now from `@qwik.dev/router`) |
| Core APIs: `component$`, `useSignal`, `useStore`, `useComputed$`, `useTask$`, `useVisibleTask$`, `useStyles$`, `$`, `Slot`, `JSXOutput`, `Signal` | **unchanged** (from `@qwik.dev/core`) |

### v2 behavioral gotchas already handled here (don't undo them)

- **Service worker removed.** v2 uses `<link rel="modulepreload">` for prefetching. The
  `src/routes/service-worker.ts` files were deleted. Keep `<ServiceWorkerRegister />` in
  `root.tsx` — in v2 it exists only to *unregister* stale service workers from old visitors.
- **`createQwikRouter()` no longer takes `qwikCityPlan`/`qwikRouterConfig`.** The router config is
  imported internally via `await import("@qwik-router-config")`. Pass only `{ render }` (and
  `manifest` where applicable). Don't add a `qwikRouterConfig` option back.
- **`isSignal(x)` takes no type argument** in v2 (was `isSignal<T>(x)` in v1).
- **`tsconfig` uses `moduleResolution: "bundler"`** and `jsxImportSource: "@qwik.dev/core"`.
- **Vite is v8** (peer range `>=6 <9`; Vite 8 uses Rolldown). Don't downgrade below 6.

When in doubt about a v2 API, check the installed type defs under
`node_modules/.pnpm/@qwik.dev+*/node_modules/@qwik.dev/{core,router}/**/*.d.ts` — they are
authoritative for this beta. Official docs: <https://qwik.dev/docs/> (Qwik City is now "Qwik Router").

## Repository layout (pnpm monorepo)

```
.                      # root = the published library (package "qwik-sonner")
├── src/
│   ├── index.ts                 # public entry (styled): exports Toaster, toast, types
│   ├── lib/
│   │   ├── index.ts             # alt entry barrel
│   │   ├── styled/              # styled Toaster + styles.css
│   │   └── headless/            # core logic: state, toast, toast-wrapper, types, icons, const
│   ├── root.tsx / entry.*.tsx   # dev/SSR harness (not published)
├── website/              # demo + docs site (Qwik Router app, deployed to Deno Deploy)
├── test/                 # Qwik Router app used by Playwright e2e tests
├── pnpm-workspace.yaml   # workspaces: ".", "website", "test"
└── playwright.config.ts
```

`pnpm-workspace.yaml` also lists `onlyBuiltDependencies` / `allowBuilds` for `esbuild` and
`sharp` — these must stay approved or `pnpm install` blocks build scripts.

## Public API of the library

- `Toaster` — the styled component you render once near the app root. Props typed as `ToasterProps`.
- `toast` — callable + namespaced helpers: `toast.success`, `.error`, `.info`, `.warning`,
  `.message`, `.loading`, `.promise`, `.dismiss`, `.custom`.
- Types: `Toast` (aliased from `ToastT`), `ExternalToast`, `ToasterProps`.

Headless entry (`qwik-sonner/headless`) exposes the unstyled `Toaster` wrapper + `toast` for
consumers who bring their own styles.

## Commands

Run library commands from the repo root; site/e2e commands from their workspace.

```bash
pnpm install              # install all workspaces (build scripts for esbuild/sharp are approved)

# Library (root)
pnpm build.types          # tsc --emitDeclarationOnly -> lib-types/  (typecheck)
pnpm build.lib            # single-pass vite lib build -> lib/ (styled + headless, ESM-only, shared chunk)
pnpm lint                 # eslint src
pnpm fmt                  # prettier --write

# Website (cd website)
pnpm build.types          # tsc --noEmit (typecheck)
pnpm build.client         # vite client build
pnpm dev                  # local dev server

# e2e (cd test, then root)
pnpm --filter test build  # build the test app
pnpm test                 # playwright (from root)
```

After any change to `src/`, the minimum green bar is: **`pnpm build.types` + `pnpm build.lib`**
pass at the root, and `pnpm build.types` passes in `website/` and `test/`.

## Qwik authoring conventions (apply to all `.tsx` here)

- Components are declared with `component$(() => { ... })`. Event handlers and inline closures that
  cross the serialization boundary must be wrapped in `$(...)` (e.g. `onClick$={$(() => ...)}`).
- State: `useSignal` for single values, `useStore` for objects, `useComputed$` for derived values.
- Side effects: `useTask$` (runs on server+client, tracks signals) and `useVisibleTask$`
  (client-only, after render). A task callback must return `void`/`Promise<void>` — don't return a
  value from it (v2 types are strict; assign inside a block instead).
- Styles via `useStyles$(stylesString)`. The styled entry imports `styles.css` as a string.
- Anything captured by a `$`-closure must be **serializable** (no class instances, DOM nodes, etc.).
- Prefer signals/`.value` over local mutable variables that need to survive re-renders.

## Conventions & guardrails

- **Package manager: pnpm only** (workspace protocol `workspace:*` links the site/test to the lib).
- TypeScript is `strict`. Keep it green; don't add `any` to silence errors — fix the type.
- Formatting is Prettier; linting is ESLint + `eslint-plugin-qwik`. Run `pnpm fmt` before finishing.
- Don't edit anything in `lib/`, `lib-types/`, `dist/`, or `tmp/` — they are build output.
- Keep `package.json#exports` intact (both `.` and `./headless`); breaking it breaks consumers.
- This is a published package — call out any change that affects the public API or build output.
