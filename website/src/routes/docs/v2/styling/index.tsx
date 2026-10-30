import { component$ } from "@qwik.dev/core";
import { type DocumentHead } from "@qwik.dev/router";
import { toast } from "qwik-sonner";
import { CodeBlock } from "~/components/CodeBlock";
import { Callout, Demo, H2, H3, PropsTable, type PropRow } from "~/components/docs/ui";

const CLASS_ROWS: PropRow[] = [
  { name: "toast", type: "ClassList", description: "The toast `<li>`." },
  { name: "title", type: "ClassList", description: "The title." },
  { name: "description", type: "ClassList", description: "The description." },
  { name: "content", type: "ClassList", description: "Wrapper of title and description." },
  { name: "icon", type: "ClassList", description: "Icon wrapper." },
  { name: "loader", type: "ClassList", description: "The loading spinner." },
  { name: "actionButton", type: "ClassList", description: "Action button." },
  { name: "cancelButton", type: "ClassList", description: "Cancel button." },
  { name: "closeButton", type: "ClassList", description: "Close button." },
  {
    name: "success, info, warning, error, loading",
    type: "ClassList",
    description: "Added to the toast `<li>` when it has that type.",
  },
  {
    name: "default",
    type: "ClassList",
    description:
      "Added to the toast `<li>` when it has no type: `toast()`, `toast.message()` and `toast.custom()` (same as sonner).",
  },
];

const VAR_ROWS: PropRow[] = [
  {
    name: "--normal-bg / --normal-border / --normal-text",
    type: "color",
    description: "Colors of a regular toast for the current theme.",
  },
  {
    name: "--success-bg / -border / -text",
    type: "color",
    description:
      "Rich colors of success toasts. Same trio for `--info-*`, `--warning-*` and `--error-*`.",
  },
  { name: "--border-radius", type: "length", default: "8px", description: "Toast corner radius." },
  {
    name: "--width",
    type: "length",
    default: "356px",
    description: "Toast width (set on the list).",
  },
  {
    name: "--gap",
    type: "length",
    default: "14px",
    description: "Space between expanded toasts — prefer the `gap` prop.",
  },
  {
    name: "--offset-{top,right,bottom,left}",
    type: "length",
    description: "Viewport offsets; set them with the `offset` / `mobileOffset` props.",
  },
  {
    name: "--gray1 … --gray12",
    type: "color",
    description: "Gray scale used by borders, the close button and the spinner.",
  },
];

const ATTR_ROWS: PropRow[] = [
  {
    name: "[data-sonner-toaster]",
    type: "<ol>",
    description:
      "A toast list, one per position in use. Also carries `data-sonner-theme`, `data-x-position`, `data-y-position` and `dir`.",
  },
  {
    name: "[data-sonner-toast]",
    type: "<li>",
    description:
      "A toast. State attributes: `data-type`, `data-styled`, `data-mounted`, `data-removed`, `data-visible`, `data-front`, `data-index`, `data-expanded`, `data-swiping`, `data-swipe-out`, `data-swipe-direction`, `data-dismissible`, `data-rich-colors`, `data-invert`, `data-promise`.",
  },
  {
    name: "[data-icon] [data-content] [data-title] [data-description]",
    type: "<div>",
    description: "The toast's parts.",
  },
  {
    name: "[data-button] [data-action] [data-cancel] [data-close-button]",
    type: "<button>",
    description: "Buttons inside a toast.",
  },
  {
    name: "[data-sonner-toaster-popover]",
    type: "<div>",
    description: "Present when `topLayer` is on; the element promoted to the top layer.",
  },
];

const classesCode = `<Toaster
  toastOptions={{
    class: "my-toast",
    descriptionClass: "my-description",
    classes: {
      title: "my-title",
      actionButton: "my-action",
      error: "my-error-toast",
    },
  }}
/>

// …or per toast
toast("Saved", { class: "my-toast", classes: { title: "font-semibold" } });`;

const tailwindCode = `<Toaster
  toastOptions={{
    unstyled: true,
    classes: {
      toast: "flex w-[356px] items-center gap-3 rounded-xl bg-zinc-900 p-4 text-sm text-white",
      title: "font-medium",
      description: "text-zinc-400",
      actionButton: "ml-auto rounded-md bg-white px-2 py-1 text-xs text-zinc-900",
    },
  }}
/>`;

const varsCode = `/* The leading "html" outranks the library's own selectors */
html [data-sonner-toaster][data-sonner-theme] {
  --border-radius: 12px;
}

html [data-sonner-toaster][data-sonner-theme="light"] {
  --normal-bg: hsl(40 30% 98%);
  --normal-border: hsl(40 20% 88%);
  --normal-text: hsl(30 10% 15%);
}`;

const styleCode = `<Toaster
  toastOptions={{
    style: { background: "hsl(270 70% 96%)", borderColor: "hsl(270 60% 85%)" },
    actionButtonStyle: { background: "hsl(270 60% 50%)" },
  }}
/>`;

const headlessCode = `import { Toaster, toast } from "qwik-sonner/headless";
import styles from "./toasts.css?inline";

export const AppToaster = component$(() => {
  useStyles$(styles); // your own stylesheet, targeting the data-sonner-* attributes
  return <Toaster />;
});`;

const popoverResetCode = `/* Only needed with the headless entry + topLayer */
[data-sonner-toaster-popover]:popover-open {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  overflow: visible;
  pointer-events: none;
}

[data-sonner-toaster-popover] [data-sonner-toaster] {
  pointer-events: auto;
}`;

export default component$(() => {
  return (
    <>
      <h1>Styling</h1>
      <p class="lead">
        From a class on one toast to owning every pixel: pick the lightest tool that does the job.
      </p>

      <ol>
        <li>
          <strong>Classes</strong> — <code>class</code>, <code>descriptionClass</code> and{" "}
          <code>classes</code>, per toast or for all of them through <code>toastOptions</code>.
        </li>
        <li>
          <strong>Inline styles</strong> — <code>style</code>, <code>actionButtonStyle</code>,{" "}
          <code>cancelButtonStyle</code>.
        </li>
        <li>
          <strong>CSS variables</strong> — recolor the built-in theme.
        </li>
        <li>
          <strong>Unstyled</strong> — keep behavior, drop the look for some toasts.
        </li>
        <li>
          <strong>Headless entry</strong> — no stylesheet at all.
        </li>
      </ol>

      <H2 id="classes">Classes</H2>
      <CodeBlock code={classesCode} />
      <PropsTable rows={CLASS_ROWS} firstColumn="classes key" />
      <p>
        Values are Qwik <code>ClassList</code>s — a string, an array or an object of booleans all
        work.
      </p>

      <H2 id="inline-styles">Inline styles</H2>
      <CodeBlock code={styleCode} />

      <H2 id="css-variables">CSS variables</H2>
      <p>
        The stylesheet reads its colors from custom properties set per theme on the toast list (
        <code>[data-sonner-toaster][data-sonner-theme="light"]</code>). Override them with a more
        specific selector, so the result doesn't depend on stylesheet order:
      </p>
      <CodeBlock code={varsCode} lang="css" />
      <PropsTable rows={VAR_ROWS} firstColumn="Variable" />

      <H2 id="unstyled">Unstyled toasts</H2>
      <p>
        <code>unstyled: true</code> removes the default box (<code>data-styled="false"</code>) but
        keeps positioning, stacking, swiping and timers — a good fit for utility classes:
      </p>
      <Demo>
        <button
          class="button"
          onClick$={() =>
            toast("Unstyled toast", {
              description: "Styled with nothing but inline styles.",
              unstyled: true,
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                width: "356px",
                padding: "14px 16px",
                borderRadius: "14px",
                background: "#18181b",
                color: "#fafafa",
                fontSize: "13px",
                boxShadow: "0 12px 32px -8px rgba(0,0,0,.35)",
              },
            })
          }
        >
          Unstyled
        </button>
      </Demo>
      <CodeBlock code={tailwindCode} />

      <H2 id="headless">Headless entry</H2>
      <p>
        <code>qwik-sonner/headless</code> exports the same <code>Toaster</code>, <code>toast</code>{" "}
        and <code>useSonner</code>, plus the inner <code>Toast</code> component and the layout
        constants (<code>TOAST_WIDTH</code>, <code>GAP</code>, <code>VIEWPORT_OFFSET</code>, …). It
        renders the same markup without injecting any CSS.
      </p>
      <CodeBlock code={headlessCode} />
      <H3 id="headless-top-layer">Top layer with the headless entry</H3>
      <p>
        The styled entry resets the browser's default <code>[popover]</code> box. Without it, add
        the reset yourself when you use <code>topLayer</code>:
      </p>
      <CodeBlock code={popoverResetCode} lang="css" />

      <H2 id="data-attributes">Data attributes</H2>
      <p>
        The markup follows sonner 2's <code>data-sonner-*</code> contract, so styles written for
        sonner carry over. Use the attributes as styling hooks or test selectors.
      </p>
      <PropsTable rows={ATTR_ROWS} firstColumn="Selector" />
      <Callout type="tip">
        <p>
          All animations are disabled under <code>prefers-reduced-motion: reduce</code>.
        </p>
      </Callout>
    </>
  );
});

export const head: DocumentHead = {
  title: "Styling — qwik-sonner",
  meta: [
    {
      name: "description",
      content: "Classes, CSS variables, unstyled toasts, the headless entry and data attributes.",
    },
  ],
  frontmatter: {
    toc: [
      { id: "classes", title: "Classes" },
      { id: "inline-styles", title: "Inline styles" },
      { id: "css-variables", title: "CSS variables" },
      { id: "unstyled", title: "Unstyled toasts" },
      { id: "headless", title: "Headless entry" },
      { id: "headless-top-layer", title: "Top layer (headless)", level: 3 },
      { id: "data-attributes", title: "Data attributes" },
    ],
  },
};
