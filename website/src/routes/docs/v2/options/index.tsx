import { $, component$ } from "@qwik.dev/core";
import { Link, type DocumentHead } from "@qwik.dev/router";
import { toast } from "qwik-sonner";
import { CodeBlock } from "~/components/CodeBlock";
import { Callout, Demo, H2, PropsTable, type PropRow } from "~/components/docs/ui";

const OPTION_ROWS: PropRow[] = [
  {
    name: "id",
    type: "string | number",
    description: "Reuse an existing id to update that toast in place.",
  },
  {
    name: "description",
    type: "string | JSXOutput | () => …",
    description: "Second line under the title.",
  },
  {
    name: "duration",
    type: "number",
    default: "4000",
    description:
      "Time in ms before the toast closes. `Number.POSITIVE_INFINITY` keeps it until dismissed.",
  },
  { name: "icon", type: "JSXOutput", description: "Replaces the icon of this toast." },
  {
    name: "action",
    type: "Action | JSXOutput",
    description: "Primary button (see below), or your own JSX.",
  },
  {
    name: "cancel",
    type: "Action | JSXOutput",
    description: "Secondary button. Does nothing on toasts with `dismissible: false`.",
  },
  {
    name: "closeButton",
    type: "boolean",
    description: "Show (or hide) the close button, overriding the Toaster.",
  },
  {
    name: "dismissible",
    type: "boolean",
    default: "true",
    description:
      "`false` disables swiping and the cancel button. Use with `duration: Infinity` for toasts that must stay.",
  },
  {
    name: "onDismiss$",
    type: "QRL<(toast: Toast) => unknown>",
    description:
      "Called when the user closes the toast with the close button or a swipe, or your code calls `toast.dismiss()`. Not called for the cancel/action buttons or the timer.",
  },
  {
    name: "onAutoClose$",
    type: "QRL<(toast: Toast) => unknown>",
    description: "Called when the toast closes because its timer ran out.",
  },
  {
    name: "position",
    type: "Position",
    description: "Show this toast in another corner than the Toaster's.",
  },
  {
    name: "toasterId",
    type: "string",
    description: "Send the toast to the `<Toaster id>` with that id.",
  },
  { name: "richColors", type: "boolean", description: "Override the Toaster's `richColors`." },
  { name: "invert", type: "boolean", description: "Override the Toaster's `invert`." },
  { name: "unstyled", type: "boolean", description: "Drop the default styles for this toast." },
  { name: "class", type: "string", description: "Class for the toast element." },
  { name: "descriptionClass", type: "string", description: "Class for the description." },
  { name: "classes", type: "ToastClassnames", description: "Per-part classes — see Styling." },
  { name: "style", type: "CSSProperties", description: "Inline style for the toast element." },
  {
    name: "actionButtonStyle",
    type: "CSSProperties",
    description: "Inline style for the action button.",
  },
  {
    name: "cancelButtonStyle",
    type: "CSSProperties",
    description: "Inline style for the cancel button.",
  },
  { name: "testId", type: "string", description: "Rendered as `data-testid` on the toast." },
  {
    name: "important",
    type: "boolean",
    description:
      "Accepted for parity with sonner's types; it currently has no effect (sonner 2 announces every toast through the region's polite live region).",
  },
];

const ACTION_ROWS: PropRow[] = [
  { name: "label", type: "string | JSXOutput", description: "Button content." },
  {
    name: "onClick$",
    type: "QRL<(event, button) => any>",
    description: "Runs on click. Wrap it in `$()`.",
  },
  {
    name: "preventDefault",
    type: "boolean",
    default: "false",
    description: "Keep the toast open after the click.",
  },
  {
    name: "actionButtonStyle",
    type: "CSSProperties",
    description: "Typed for parity; style buttons through the toast's `actionButtonStyle`.",
  },
];

const durationCode = `toast("Saved", { duration: 10000 });

// Stays until the user or your code dismisses it
toast("Connection lost", { duration: Number.POSITIVE_INFINITY });`;

const callbacksCode = `import { $ } from "@qwik.dev/core";

toast("Event has been created", {
  onDismiss$: $((t) => console.log(\`Toast \${t.id} was dismissed\`)),
  onAutoClose$: $((t) => console.log(\`Toast \${t.id} closed on its own\`)),
});`;

const positionCode = `toast("Copied to clipboard", { position: "top-center" });`;

const persistentCode = `toast.warning("You have unsaved changes", {
  duration: Number.POSITIVE_INFINITY,
  dismissible: false,
  action: { label: "Save", onClick$: $(() => save()) },
});`;

export default component$(() => {
  return (
    <>
      <h1>Toast options</h1>
      <p class="lead">
        The last argument of every <code>toast</code> helper — typed as <code>ExternalToast</code>.
        Toaster-wide defaults live in{" "}
        <Link href="/docs/v2/toaster/#toast-options">
          <code>toastOptions</code>
        </Link>
        .
      </p>

      <H2 id="reference">Reference</H2>
      <PropsTable rows={OPTION_ROWS} firstColumn="Option" />

      <H2 id="action">Action</H2>
      <p>
        The shape of <code>action</code> and <code>cancel</code> when you don't pass JSX:
      </p>
      <PropsTable rows={ACTION_ROWS} firstColumn="Field" />

      <H2 id="duration">Duration</H2>
      <Demo>
        <button class="button" onClick$={() => toast("Ten seconds", { duration: 10000 })}>
          10 seconds
        </button>
        <button
          class="button"
          onClick$={() =>
            toast("Stays until dismissed", {
              duration: Number.POSITIVE_INFINITY,
              closeButton: true,
            })
          }
        >
          Persistent
        </button>
      </Demo>
      <CodeBlock code={durationCode} />
      <p>Hovering the toasts, pressing on them, or hiding the tab pauses every timer.</p>

      <H2 id="callbacks">Callbacks</H2>
      <Demo>
        <button
          class="button"
          onClick$={() =>
            toast("Swipe me, or wait", {
              closeButton: true,
              onDismiss$: $(() => toast.info("onDismiss$ fired")),
              onAutoClose$: $(() => toast.info("onAutoClose$ fired")),
            })
          }
        >
          Try the callbacks
        </button>
      </Demo>
      <CodeBlock code={callbacksCode} />

      <H2 id="position">Position</H2>
      <Demo>
        <button
          class="button"
          onClick$={() => toast("Copied to clipboard", { position: "top-center" })}
        >
          Top center
        </button>
      </Demo>
      <CodeBlock code={positionCode} />

      <H2 id="persistent">Toasts that must stay</H2>
      <Demo>
        <button
          class="button"
          onClick$={() => {
            const id = toast.warning("You have unsaved changes", {
              duration: Number.POSITIVE_INFINITY,
              dismissible: false,
              action: {
                label: "Save",
                onClick$: $(() => {
                  toast.success("Saved", { id, dismissible: true, duration: 3000 });
                }),
                preventDefault: true,
              },
            });
          }}
        >
          Unsaved changes
        </button>
      </Demo>
      <CodeBlock code={persistentCode} />
      <Callout type="note">
        <p>
          The close button still renders on non-dismissible toasts when <code>closeButton</code> is
          on, but it does nothing — same as sonner.
        </p>
      </Callout>
    </>
  );
});

export const head: DocumentHead = {
  title: "Toast options — qwik-sonner",
  meta: [
    {
      name: "description",
      content: "Every option accepted by toast(), toast.success() and friends.",
    },
  ],
  frontmatter: {
    toc: [
      { id: "reference", title: "Reference" },
      { id: "action", title: "Action" },
      { id: "duration", title: "Duration" },
      { id: "callbacks", title: "Callbacks" },
      { id: "position", title: "Position" },
      { id: "persistent", title: "Toasts that must stay" },
    ],
  },
};
