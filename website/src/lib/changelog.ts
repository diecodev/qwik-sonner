// Release notes, by `major.minor` series. Only the words live here: which version is the newest of a series, its
// dist-tag, its day and the versions before it come from npm when the site builds (see release.ts).

export type ChangeKind = "breaking" | "feature" | "fix" | "deprecated" | "docs";

export interface Change {
  kind: ChangeKind;
  /** Plain text; wrap code in backticks — rendered as inline `<code>`. */
  text: string;
  /** The patch that brought it, when the series has several. */
  version?: string;
}

export interface SeriesNotes {
  /** `major.minor`, e.g. `"2.0"` */
  series: string;
  summary?: string;
  changes: Change[];
}

export const KIND_LABEL: Record<ChangeKind, string> = {
  breaking: "Breaking",
  feature: "Feature",
  fix: "Fix",
  deprecated: "Deprecated",
  docs: "Docs",
};

// Curated from the git history (`git log vA..vB`). Newest first.
export const NOTES: SeriesNotes[] = [
  {
    series: "2.0",
    summary:
      "A ground-up port to Qwik 2 (`@qwik.dev/core`) with feature parity with sonner 2.0.7. Zero runtime dependencies.",
    changes: [
      {
        kind: "breaking",
        text: "Requires Qwik 2: `@qwik.dev/core` (>= 2.0.0-beta.37) is now a peer dependency. Qwik 1 (`@builder.io/qwik`) is no longer supported — stay on 1.x for Qwik 1 apps.",
      },
      {
        kind: "breaking",
        text: "ESM-only package. The CommonJS builds (`*.qwik.cjs`) were removed.",
      },
      {
        kind: "breaking",
        text: "String `title`/`description` values render as text instead of sanitized HTML; the DOMPurify dependency is gone. Pass JSX for rich content.",
      },
      {
        kind: "breaking",
        text: "Icons (`icons`, per-toast `icon`, `loadingIcon`) take JSX (`JSXOutput`) instead of a `Component`.",
      },
      {
        kind: "breaking",
        text: "Defaults aligned with sonner 2: viewport `offset` 32px → 24px (new `mobileOffset`, 16px) and swipe threshold 20px → 45px. Markup and stylesheet follow sonner's `data-sonner-*` contract.",
      },
      {
        kind: "breaking",
        text: '`important` no longer switches a toast to `aria-live="assertive"`; all toasts are announced through the toaster\'s polite live region (sonner 2). `theme="system"` stops reading/writing `localStorage.theme`.',
      },
      {
        kind: "feature",
        text: "Swipe to dismiss in any direction with drag dampening, configurable through `swipeDirections`.",
      },
      {
        kind: "feature",
        text: "Multiple toasters: give a `<Toaster>` an `id` and target it with `toasterId`.",
      },
      {
        kind: "feature",
        text: "`topLayer` prop renders toasts above native `<dialog>` modals and fullscreen elements via the Popover API.",
      },
      {
        kind: "feature",
        text: "`position`, `theme`, `richColors`, `dir` and `invert` accept a `Signal` to change at runtime.",
      },
      {
        kind: "feature",
        text: "`useSonner()` hook, plus `toast.getToasts()` and `toast.getHistory()`.",
      },
      {
        kind: "feature",
        text: "`toast.promise()` gains `unwrap()`, extended results (`{ message, ...options }`), JSX results and automatic error toasts for failed `Response`s and `Error` values.",
      },
      {
        kind: "feature",
        text: "New options: per-toast `richColors` and `testId`, per-side `offset` objects, `mobileOffset`, `icons.close`, `customAriaLabel` and `toastOptions.closeButtonAriaLabel`.",
      },
      {
        kind: "feature",
        text: "New exported types: `ToastClassnames`, `ToastToDismiss` and `Action`.",
      },
      { kind: "fix", text: "The first toast animates its enter transition." },
      {
        kind: "fix",
        text: "Swiped toasts keep sliding off-screen instead of snapping back before fading.",
      },
      {
        kind: "fix",
        text: "Pointer capture is set synchronously, so a swipe no longer sticks to the cursor.",
      },
      {
        kind: "fix",
        text: "The Toaster subscribes on `qinit`, so toasts render in Safari/WebKit and when the Toaster sits below the fold.",
      },
      {
        kind: "deprecated",
        text: "`pauseWhenPageIsHidden` — timers now always pause while the page is hidden.",
      },
      { kind: "deprecated", text: "`loadingIcon` — use `icons.loading`." },
    ],
  },
  {
    series: "1.0",
    summary: "The stable line for Qwik 1.",
    changes: [
      {
        kind: "feature",
        text: "New build and publish pipeline, gated on the e2e suite.",
        version: "1.0.0",
      },
      { kind: "fix", text: "Toasts use the correct CSS class names.", version: "1.0.0" },
      {
        kind: "fix",
        text: "Fixed the `qwik-sonner/headless` path in `exports`.",
        version: "1.0.1",
      },
      {
        kind: "fix",
        text: "Corrected the type declarations of the headless entry.",
        version: "1.0.2",
      },
      { kind: "fix", text: "`closeButton` works as expected.", version: "1.0.3" },
    ],
  },
  {
    series: "0.4",
    changes: [
      { kind: "feature", text: "`dir` prop: `rtl`, `ltr` or `auto`.", version: "0.4.0" },
      {
        kind: "fix",
        text: "Higher CSS specificity so app styles don't leak into toasts.",
        version: "0.4.0",
      },
    ],
  },
  {
    series: "0.3",
    changes: [
      {
        kind: "feature",
        text: "Headless entry point: `qwik-sonner/headless` ships the core without styles.",
        version: "0.3.2",
      },
      {
        kind: "feature",
        text: "`theme` can change at runtime through a signal.",
        version: "0.3.4",
      },
      { kind: "feature", text: "Updated to Qwik 1.5.1.", version: "0.3.0" },
      { kind: "fix", text: "Headless types are exported.", version: "0.3.1" },
    ],
  },
  {
    series: "0.2",
    changes: [
      {
        kind: "feature",
        text: "Pass attributes and event handlers through to the toast list.",
        version: "0.2.0",
      },
      {
        kind: "fix",
        text: "Resumability: the Toaster no longer eagerly loads its code.",
        version: "0.2.0",
      },
      {
        kind: "fix",
        text: "Removed `NodeJS` namespace types from the public API.",
        version: "0.2.1",
      },
    ],
  },
  {
    series: "0.1",
    changes: [
      { kind: "feature", text: "`ToasterProps` is exported." },
      { kind: "fix", text: "`position` can change dynamically." },
      { kind: "fix", text: "Default styles are applied to the Toaster." },
      { kind: "docs", text: "Documentation website." },
    ],
  },
  {
    series: "0.0",
    summary: "Initial release — a Qwik port of sonner.",
    changes: [{ kind: "fix", text: "Toaster type declarations.", version: "0.0.2" }],
  },
];
