import { component$ } from "@qwik.dev/core";
import { type DocumentHead } from "@qwik.dev/router";
import { CodeBlock } from "~/components/CodeBlock";
import { H2, H3, PropsTable, type PropRow } from "~/components/docs/ui";

// Source of truth: src/lib/headless/types.ts at tag v1.0.3.

const signatureCode = `toast(message, options?)            // message: string | JSXOutput
toast.message(message, options?)
toast.success(message, options?)
toast.info(message, options?)
toast.warning(message, options?)
toast.error(message, options?)
toast.loading(message, options?)
toast.promise(promise, data)
toast.custom((id) => jsx, options?)
toast.dismiss(id?)`;

const actionCode = `import { $ } from "@builder.io/qwik";

toast("Event has been created", {
  action: {
    label: "Undo",
    onClick$: $(() => console.log("Undo")),
  },
});`;

const promiseCode = `import { $ } from "@builder.io/qwik";

toast.promise(() => new Promise((resolve) => setTimeout(resolve, 2000)), {
  loading: "Loading…",
  success: $((data) => \`\${data.name} has been added!\`),
  error: "Error",
});`;

const customCode = `// Custom JSX with the default styling
toast(<div>My custom toast</div>);

// Fully custom, unstyled
toast.custom((id) => (
  <div>
    <h1>Custom toast</h1>
    <button onClick$={() => toast.dismiss(id)}>Dismiss</button>
  </div>
));`;

const updateCode = `const toastId = toast("Sonner");

toast.success("Toast has been updated", { id: toastId });

toast.dismiss(toastId); // one toast
toast.dismiss();        // all toasts`;

const callbacksCode = `toast("Event has been created", {
  onDismiss$: $((t) => console.log(\`Toast \${t.id} has been dismissed\`)),
  onAutoClose$: $((t) => console.log(\`Toast \${t.id} has been closed automatically\`)),
});`;

const TOASTER_ROWS: PropRow[] = [
  {
    name: "position",
    type: "Position",
    default: '"bottom-right"',
    description: "Corner the toasts stack in.",
  },
  {
    name: "theme",
    type: '"light" | "dark" | "system"',
    default: '"light"',
    description: "Color scheme.",
  },
  {
    name: "richColors",
    type: "boolean",
    default: "false",
    description: "Colored success/error/info/warning toasts.",
  },
  {
    name: "invert",
    type: "boolean | Signal<boolean>",
    default: "false",
    description: "Invert toast colors.",
  },
  { name: "expand", type: "boolean", default: "false", description: "Expand all toasts." },
  { name: "visibleToasts", type: "number", default: "3", description: "Toasts visible at once." },
  {
    name: "closeButton",
    type: "boolean",
    default: "false",
    description: "Close button on every toast.",
  },
  { name: "duration", type: "number", default: "4000", description: "Default duration in ms." },
  { name: "gap", type: "number", default: "14", description: "Gap between expanded toasts (px)." },
  {
    name: "offset",
    type: "string | number",
    default: '"32px"',
    description: "Distance from the viewport edges.",
  },
  {
    name: "dir",
    type: '"rtl" | "ltr" | "auto"',
    default: '"auto"',
    description: "Text direction.",
  },
  {
    name: "hotkey",
    type: "string[]",
    default: '["altKey", "KeyT"]',
    description: "Keys that focus the toasts.",
  },
  {
    name: "toastOptions",
    type: "ToastOptions",
    description:
      "Defaults for every toast: `class`, `descriptionClass`, `style`, `actionButtonStyle`, `cancelButtonStyle`, `duration`, `unstyled`, `classes`, `closeButton`.",
  },
  {
    name: "icons",
    type: "ToastIcons",
    description: "Components for `success`, `info`, `warning`, `error`, `loading`.",
  },
  {
    name: "containerAriaLabel",
    type: "string",
    default: '"Notifications"',
    description: "Label of the toasts region.",
  },
  {
    name: "pauseWhenPageIsHidden",
    type: "boolean",
    description: "Pause timers while the tab is hidden.",
  },
  {
    name: "class / style",
    type: "string / CSSProperties",
    description: "Applied to the toast list.",
  },
  { name: "loadingIcon", type: "Component", deprecated: true, description: "Use `icons.loading`." },
];

const OPTION_ROWS: PropRow[] = [
  { name: "id", type: "string | number", description: "Reuse to update an existing toast." },
  {
    name: "description",
    type: "string | JSXOutput",
    description: "Second line. Strings are parsed as sanitized HTML.",
  },
  {
    name: "duration",
    type: "number",
    default: "4000",
    description: "Use `Number.POSITIVE_INFINITY` to persist.",
  },
  { name: "icon", type: "Component", description: "Custom icon component." },
  {
    name: "action / cancel",
    type: "Action | JSXOutput",
    description: "`{ label, onClick$, preventDefault? }` or JSX.",
  },
  { name: "closeButton", type: "boolean", description: "Override the Toaster's close button." },
  {
    name: "dismissible",
    type: "boolean",
    default: "true",
    description: "Allow swiping / closing.",
  },
  { name: "important", type: "boolean", description: 'Announce with `aria-live="assertive"`.' },
  { name: "position", type: "Position", description: "Override the Toaster position." },
  { name: "invert", type: "boolean", description: "Invert this toast's colors." },
  {
    name: "onDismiss$",
    type: "QRL<(toast) => unknown>",
    description: "Close button clicked or toast swiped.",
  },
  { name: "onAutoClose$", type: "QRL<(toast) => unknown>", description: "Timer ran out." },
  { name: "unstyled", type: "boolean", description: "Drop the default styles." },
  {
    name: "class / descriptionClass / classes",
    type: "string / string / ToastClassnames",
    description: "Classes for the toast and its parts.",
  },
  {
    name: "style / actionButtonStyle / cancelButtonStyle",
    type: "CSSProperties",
    description: "Inline styles.",
  },
];

const PROMISE_ROWS: PropRow[] = [
  { name: "loading", type: "string", description: "Loading message." },
  {
    name: "success",
    type: "string | JSXOutput | QRL<(data) => …>",
    description: "Shown on resolve.",
  },
  {
    name: "error",
    type: "string | JSXOutput | QRL<(error) => …>",
    description: "Shown on reject.",
  },
  {
    name: "description",
    type: "string | JSXOutput | QRL<(data) => …>",
    description: "Description of the settled toast.",
  },
  {
    name: "finally",
    type: "() => void | Promise<void>",
    description: "Runs when the promise settles.",
  },
];

export default component$(() => {
  return (
    <>
      <h1>API reference</h1>
      <p class="lead">
        Everything exported by qwik-sonner 1.x: <code>Toaster</code>, <code>toast</code> and the{" "}
        <code>Toast</code>, <code>ExternalToast</code> and <code>ToasterProps</code> types.
      </p>

      <H2 id="toast">toast()</H2>
      <CodeBlock code={signatureCode} />

      <H3 id="action">Action</H3>
      <CodeBlock code={actionCode} />

      <H3 id="promise">Promise</H3>
      <CodeBlock code={promiseCode} />
      <PropsTable rows={PROMISE_ROWS} firstColumn="Field" />

      <H3 id="custom">Custom JSX</H3>
      <CodeBlock code={customCode} />

      <H3 id="update">Updating and dismissing</H3>
      <CodeBlock code={updateCode} />

      <H3 id="callbacks">Callbacks</H3>
      <CodeBlock code={callbacksCode} />

      <H2 id="toaster">Toaster props</H2>
      <PropsTable rows={TOASTER_ROWS} />

      <H2 id="options">Toast options</H2>
      <PropsTable rows={OPTION_ROWS} firstColumn="Option" />
    </>
  );
});

export const head: DocumentHead = {
  title: "API reference (v1) — qwik-sonner",
  meta: [
    { name: "description", content: "toast() and <Toaster /> reference for qwik-sonner 1.x." },
  ],
  frontmatter: {
    toc: [
      { id: "toast", title: "toast()" },
      { id: "action", title: "Action", level: 3 },
      { id: "promise", title: "Promise", level: 3 },
      { id: "custom", title: "Custom JSX", level: 3 },
      { id: "update", title: "Updating and dismissing", level: 3 },
      { id: "callbacks", title: "Callbacks", level: 3 },
      { id: "toaster", title: "Toaster props" },
      { id: "options", title: "Toast options" },
    ],
  },
};
