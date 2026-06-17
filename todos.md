# qwik-sonner — pending improvements

Backlog of improvements. Ordered by impact. Everything under "Done" already landed.

---

## ✅ Done — Vite 8 / build overhaul

- **Vite 7 → 8** in root, `website/`, and `test/` (within the qwik v2 peer range `vite >=6 <9`).
  - Note: Vite 8 uses **Rolldown**. A non-fatal `INVALID_ANNOTATION` warning about a
    `/*#__PURE__*/` comment originates in `@qwik.dev/core`'s minified bundle (upstream).
- **Build process overhaul** (`vite.config.ts`): single-pass multi-entry lib build, **ESM-only**
  output, correct externalization of `@qwik.dev/core`.
- **`package.json`** hygiene: `@qwik.dev/core` peerDependency, `exports` lists `types` first,
  `module` + `sideEffects: false`, `prepublishOnly` runs `build.types && build.lib`.

## ✅ Done — Phase 2 (DOMPurify removed)

`toast.title`/`toast.description` now render as text/JSX nodes (no `dangerouslySetInnerHTML`,
no DOMPurify). The library is dependency-free. (commit `c91beb2`)

## ✅ Done — Phase 3 + most of Phase 4 (1:1 with sonner 2.0.7, Qwik v2)

Full port to **sonner 2.0.7**. The library now matches sonner's DOM contract, CSS, and feature
set (adapted to Qwik idioms). **This is a breaking change → major version bump.**

### DOM contract / CSS (breaking, observable)
- Renders **`data-sonner-toast` / `data-sonner-toaster` / `data-sonner-theme`** and `sonner-*`
  class names (was `data-qwik-*` / `qwik-*`). `styles.css` is now sonner 2.0.7's stylesheet
  verbatim. This is what lets sonner's documented CSS customization work, and it fixes the
  website's `[data-sonner-toast]` query in `Position.tsx` (which was silently broken before).
- Defaults aligned to sonner: viewport offset **24px** (mobile 16px), swipe threshold **45**.
- `aria-live`/`aria-relevant`/`aria-atomic` moved to the `<section>` live region (per sonner).

### ToasterProps
- `id` (multiple `<Toaster>` instances via `toasterId` routing), `mobileOffset`,
  `offset` as an `Offset` object, `swipeDirections`, `customAriaLabel`.
- `theme` resolution now uses `matchMedia` (no `localStorage`), with a live `change` listener for
  `theme="system"` — matches sonner.

### ToastT / ExternalToast
- `toasterId`, per-toast `richColors`, `testId`, custom close icon (`icons.close`),
  hide an icon by passing `null`, and `title`/`description` as `() => JSXOutput`.

### toast API
- **`useSonner()`** — Qwik hook returning a `Signal` of the active toasts.
- **`toast.getToasts()` / `toast.getHistory()`**.
- **`toast.promise(...)` rewritten** to sonner 2.0.7: returns `{ unwrap }` (or `id` + `unwrap`),
  handles HTTP `Response`, `Error`, JSX, and extended-result objects (`{ message, ...opts }`).

### Behavior
- **Multi-direction swipe + drag damping** (`--swipe-amount-x/y`, `data-swipe-direction`,
  `data-swiped`, right-click + text-selection guards, `getDefaultSwipeDirections`).
- Timer always pauses while the page is hidden (sonner dropped the `pauseWhenPageIsHidden` gate).
- Close button is hidden on `loading` toasts.

### Qwik v2 idioms
- **Removed the `useVisibleTask$` mount hack.** The enter-animation `mounted` flip now runs in a
  `useTask$` + `requestAnimationFrame` guarded by `isBrowser`. The remaining client-mount work
  (observer subscription, system-theme resolution) uses event-based `onQVisible$` / `useOn`
  (a recommended alternative, not a visible task).
- Reactive props are read via `props.*` inside tasks/computeds (Qwik destructuring-reactivity rule).

### Bug fixes found while getting e2e green (chromium + webkit, 36/36)
- **`toast.custom` was dropping its `jsx`.** The Qwik optimizer rewrites `const { message, ...rest }
  = data` into `_restProps(data, ["message"])`, which strips the `jsx` property. `state.ts#create`
  now uses native spread + `delete` instead of rest-destructuring. (Watch for this anywhere a plain
  object is rest-destructured.)
- **`tsconfig.lib.json` now sets `rootDir: "src/lib"`** — tsc otherwise errors TS5011 (ambiguous
  common source dir) on a clean emit. Output layout under `lib-types/` is unchanged.
- **Swipe e2e specs updated to clean, axis-aligned drags** (`x` constant + `{steps}`). With
  multi-direction swipe, the old single-jump-to-`x=0` paths lock the *horizontal* axis on a
  bottom-right toast (a mostly-leftward, non-dismiss gesture → damped). This matches sonner's own
  updated test methodology; the library dismisses real vertical/horizontal swipes correctly.
- **Focus management uses `onFocusOut$`, not `onBlur$`.** Qwik's `onBlur$` is the native
  non-bubbling `blur`; React's `onBlur` is `focusout` (bubbles), so a removed descendant wasn't
  caught. Also, focus is restored when the toaster **empties** (keyed off toast count) rather than
  via a ref-cleanup — Qwik doesn't reset refs on unmount, so React's "ol unmount" cleanup can't be
  replicated through the ref.

### Backwards-compat shims (kept so no consumer breaks)
- `loadingIcon` (deprecated; still wired through), `pauseWhenPageIsHidden` (deprecated no-op),
  Qwik-idiomatic prop names retained: `class`/`classes`/`descriptionClass`, `onClick$`/
  `onDismiss$`/`onAutoClose$`, and `Action.preventDefault` (the test app depends on it).

---

## Remaining

### Phase 4 — deferred by design
- [ ] **Context/store state model.** State is still a module-global `Observer` — **the same design
      as sonner** (a singleton). Multiple `<Toaster>` / `toasterId` already work via
      component-level filtering, so this is not required. The SSR-sharing hazard is theoretical
      (toasts are client-triggered, so the singleton is empty during SSR). Revisit only if a
      per-request store is ever needed.
- [ ] **`sync$` for pointer handlers** — not applicable as-is: the swipe handlers capture
      component signals/state, which `sync$` cannot serialize (it only allows event + global
      scope). Left as regular `$` handlers.

### Extras (not part of the 1:1 port; intentionally out of scope)
- [x] **Q14 (`qrlMissingChunk` / `_run`) in production SSR** — `pnpm preview` threw `Code(Q14)`
      because Qwik wraps every event handler with lexical captures in an internal `_run` runtime
      QRL (core.mjs ~12237), and **under Vite 8 / Rolldown the production build never registered the
      internal handler symbols** (`_run`/`_task`). Dev worked (it has a `_`-symbol fallback) and e2e
      passed because Playwright runs against `pnpm dev`. **Root cause = Vite 8 (Rolldown).**
      Resolved by **pinning `vite` to `^7` in the catalog** (Qwik peer allows `>=6 <9`). Verified:
      `pnpm preview` on the test renders with 0 Q14 errors and **no workaround needed**. The
      temporary `_regSymbol` workaround in `test/src/entry.ssr.tsx` and the `onLog` INVALID_ANNOTATION
      suppressors in the vite configs were removed. Revisit Vite 8 only once Qwik v2 fixes Rolldown.
- [ ] **Flaky webkit swipe test** — `test/tests/basic.spec.ts:209` ("toast's dismiss callback gets
      executed correctly") fails on the **webkit** project but passes on chromium. It drives a
      mouse-drag swipe (`page.mouse.move/down/up`, +300px) to dismiss a toast; webkit's headless
      pointer simulation doesn't reliably trigger the swipe-out → `onDismiss$`. **Not a regression:**
      verified it fails identically under both Vite 7 and Vite 8, so it's environmental, not caused
      by the vite downgrade. Fix idea: dispatch real `pointerdown`/`pointermove`/`pointerup` events
      (with `pointerId`/`pressure`) instead of `mouse.*`, or skip on webkit.
- [x] **`pnpm lint` was broken under eslint 10** — resolved by migrating off ESLint/Prettier to
      **oxlint + oxfmt**. `eslint-plugin-qwik` is now loaded through oxlint's `jsPlugins`
      (`.oxlintrc.json`). Caveat: oxlint's JS-plugin runtime has no type info, so the two
      type-aware Qwik rules `valid-lexical-scope` and `use-async-top` cannot run and are omitted;
      the other 14 Qwik rules + `no-unused-vars` are active.
- [ ] **Toolchain**: TypeScript 5.4.5 → latest 5.x.
- [ ] **Drop `vite-tsconfig-paths`** — Vite 8 resolves tsconfig paths natively
      (`resolve.tsconfigPaths: true`); the build already prints this hint.
- [x] **e2e parity with sonner 2.0.7** — ported every test from sonner's `basic.spec.ts`
      (extended/error/Error-object promises, `unwrap` rejection, focus return, timed re-update,
      empty-id custom dismiss, custom ARIA labels, `toasterId` routing across two Toasters, and
      `testId` behaviors). `test/tests/basic.spec.ts` now passes **36/36 in chromium + webkit**.
- [ ] Optional extra coverage for features sonner itself doesn't e2e: `useSonner()`, `mobileOffset`,
      `icons.close`.
- [ ] **CHANGELOG / README**: document the breaking changes (ESM-only; `@qwik.dev/core` peer dep;
      `data-sonner-*` DOM contract; offset/swipe-threshold defaults). Consider npm provenance.
- [x] **Root `pnpm fmt` over-reaches** — now `oxfmt`, which respects `.gitignore` (so it skips
      `lib/`, `lib-types/`, `dist/`, `server/`, caches) and each workspace owns its own
      `.oxfmtrc.json`. Note: switching formatters means the first `pnpm fmt` will reformat existing
      files into oxfmt's style (not yet run, to avoid a large unrelated diff). Also: oxfmt has no
      plugin system, so the website's old `prettier-plugin-tailwindcss` class sorting is dropped.
