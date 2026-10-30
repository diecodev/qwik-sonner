import { component$, Fragment, Slot, useSignal, type JSXOutput } from "@qwik.dev/core";
import { inline } from "./inline";
import { CodeBlock } from "../CodeBlock";
import styles from "./ui.module.css";

/* Headings ---------------------------------------------------------------- */

export const H2 = component$<{ id: string }>(({ id }) => (
  <h2 id={id} class={styles.heading}>
    <a href={`#${id}`} class={styles.anchor}>
      <Slot />
    </a>
  </h2>
));

export const H3 = component$<{ id: string }>(({ id }) => (
  <h3 id={id} class={styles.heading}>
    <a href={`#${id}`} class={styles.anchor}>
      <Slot />
    </a>
  </h3>
));

/* Callout ----------------------------------------------------------------- */

const CALLOUT_ICON: Record<CalloutType, () => JSXOutput> = {
  note: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
      <path
        fill-rule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clip-rule="evenodd"
      />
    </svg>
  ),
  tip: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
      <path
        fill-rule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clip-rule="evenodd"
      />
    </svg>
  ),
  warning: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
      <path
        fill-rule="evenodd"
        d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
        clip-rule="evenodd"
      />
    </svg>
  ),
  danger: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
      <path
        fill-rule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
        clip-rule="evenodd"
      />
    </svg>
  ),
};

type CalloutType = "note" | "tip" | "warning" | "danger";

/** Uses the same icons and rich colors as the toasts themselves. */
export const Callout = component$<{ type?: CalloutType; title?: string }>(
  ({ type = "note", title }) => (
    <aside class={styles.callout} data-type={type}>
      <span class={styles.calloutIcon}>{CALLOUT_ICON[type]()}</span>
      <div class={styles.calloutBody}>
        {title ? <strong class={styles.calloutTitle}>{title}</strong> : null}
        <Slot />
      </div>
    </aside>
  ),
);

/* API tables -------------------------------------------------------------- */

export interface PropRow {
  name: string;
  type: string;
  default?: string;
  /** Supports `code` and **bold** (see `inline`). */
  description: string;
  deprecated?: boolean;
  /** Accepts a `Signal` for runtime changes. */
  signal?: boolean;
}

export const PropsTable = component$<{ rows: PropRow[]; firstColumn?: string }>(
  ({ rows, firstColumn = "Prop" }) => (
    <div class={styles.tableWrap}>
      <table class={styles.table}>
        <thead>
          <tr>
            <th>{firstColumn}</th>
            <th>Type</th>
            <th>Default</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Fragment key={row.name}>
              <tr class={styles.rowHead}>
                <td>
                  <code class={styles.propName} data-deprecated={row.deprecated}>
                    {row.name}
                  </code>
                  {row.signal ? (
                    <span class={styles.pill} title="Accepts a Signal for runtime changes">
                      Signal
                    </span>
                  ) : null}
                  {row.deprecated ? (
                    <span class={styles.pill} data-tone="warning">
                      Deprecated
                    </span>
                  ) : null}
                </td>
                <td>
                  <code class={styles.type}>{row.type}</code>
                </td>
                <td>{row.default ? <code class={styles.type}>{row.default}</code> : "—"}</td>
              </tr>
              <tr class={styles.rowDesc}>
                <td colSpan={3}>{inline(row.description)}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  ),
);

/* Demo -------------------------------------------------------------------- */

/** Live preview surface; put `.button`s in the default slot. */
export const Demo = component$<{ hint?: string }>(({ hint }) => (
  <div class={styles.demo}>
    <div class="buttons">
      <Slot />
    </div>
    {hint ? <p class={styles.demoHint}>{hint}</p> : null}
  </div>
));

/* Package manager tabs ---------------------------------------------------- */

const MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
type Manager = (typeof MANAGERS)[number];
const COMMAND: Record<Manager, string> = {
  npm: "npm install",
  pnpm: "pnpm add",
  yarn: "yarn add",
  bun: "bun add",
};

export const InstallTabs = component$<{ spec: string }>(({ spec }) => {
  const active = useSignal<Manager>("npm");
  const index = MANAGERS.indexOf(active.value);

  return (
    <div class={styles.tabs}>
      <div
        class={styles.tabList}
        role="tablist"
        aria-label="Package manager"
        style={{ "--tab-index": index }}
      >
        <span class={styles.tabIndicator} aria-hidden="true" />
        {MANAGERS.map((pm) => (
          <button
            key={pm}
            type="button"
            role="tab"
            aria-selected={active.value === pm}
            class={styles.tab}
            onClick$={() => (active.value = pm)}
          >
            {pm}
          </button>
        ))}
      </div>
      <CodeBlock code={`${COMMAND[active.value]} ${spec}`} lang="sh" class={styles.tabCode} />
    </div>
  );
});
