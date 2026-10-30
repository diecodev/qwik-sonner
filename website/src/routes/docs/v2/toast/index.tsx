import { $, component$ } from "@qwik.dev/core";
import { Link, type DocumentHead } from "@qwik.dev/router";
import { toast } from "qwik-sonner";
import { CodeBlock } from "~/components/CodeBlock";
import { Callout, Demo, H2, H3, PropsTable, type PropRow } from "~/components/docs/ui";

const signatureCode = `toast(message, options?)          // neutral toast
toast.message(message, options?)  // alias of toast()
toast.success(message, options?)
toast.info(message, options?)
toast.warning(message, options?)
toast.error(message, options?)
toast.loading(message, options?)  // spinner, never auto-closes
toast.promise(promise, data)      // loading → success / error
toast.custom((id) => jsx, options?)
toast.dismiss(id?)                // one toast, or all of them
toast.getToasts()                 // active toasts
toast.getHistory()                // everything created so far`;

const typesCode = `toast("Event has been created");

toast("Event has been created", {
  description: "Monday, January 3rd at 6:00pm",
});

toast.success("Event has been created");
toast.info("Be at the area 10 minutes before the event time");
toast.warning("Event start time cannot be earlier than 8am");
toast.error("Event has not been created");
toast.loading("Creating event…");`;

const actionCode = `import { $ } from "@qwik.dev/core";

toast("Event has been created", {
  action: {
    label: "Undo",
    onClick$: $(() => toast.success("Change reverted")),
    // preventDefault: true, // keep the toast open after the click
  },
  cancel: {
    label: "Cancel",
    onClick$: $(() => console.log("Cancelled")),
  },
});`;

const promiseCode = `import { $ } from "@qwik.dev/core";

const createEvent = $(
  () => new Promise<{ name: string }>((resolve) =>
    setTimeout(() => resolve({ name: "Sonner" }), 2000),
  ),
);

const result = toast.promise(createEvent, {
  loading: "Creating event…",
  success: $((data: { name: string }) => \`\${data.name} has been created\`),
  error: "Could not create the event",
  finally: $(() => console.log("settled")),
});

// Await the original value (or rejection) after the toast updates.
const data = await result.unwrap();`;

const extendedCode = `toast.promise(save, {
  loading: "Saving…",
  // Return { message, ...options } to also change the toast's options.
  success: $((data: Doc) => ({
    message: "Saved",
    description: \`\${data.title} is up to date\`,
    action: { label: "View", onClick$: $(() => open(data.url)) },
  })),
  error: $((err: Error) => err.message),
});`;

const customCode = `// JSX as the message keeps the default toast styling
toast(<span>Signed in as <strong>diecodev</strong></span>);

// toast.custom renders only your markup; the callback receives the id
toast.custom(
  (id) => (
    <div class="my-toast">
      <strong>You've unlocked Pro</strong>
      <button onClick$={() => toast.dismiss(id)}>Dismiss</button>
    </div>
  ),
  { duration: Number.POSITIVE_INFINITY },
);`;

const updateCode = `const id = toast.loading("Uploading…");

// Same id → the toast updates in place, keeping its position in the stack
toast.success("Upload complete", { id });`;

const dismissCode = `const id = toast("Event has been created");

toast.dismiss(id); // remove one toast
toast.dismiss();   // remove every toast`;

const stateCode = `toast.getToasts();  // toasts currently on screen (not dismissed)
toast.getHistory(); // every toast created so far, including dismissed ones`;

const PROMISE_ROWS: PropRow[] = [
  {
    name: "loading",
    type: "string | JSXOutput",
    description:
      "Message of the loading toast. Without it no toast is shown until the promise settles.",
  },
  {
    name: "success",
    type: "string | JSXOutput | QRL<(data) => …> | ExtendedResult",
    description:
      "Shown when the promise resolves. Functions receive the resolved value and may return a message or `{ message, ...options }`.",
  },
  {
    name: "error",
    type: "string | JSXOutput | QRL<(error) => …> | ExtendedResult",
    description:
      "Shown when the promise rejects, resolves to an `Error`, or resolves to a `Response` with `ok: false` (the function then receives `HTTP error! status: <code>`).",
  },
  {
    name: "description",
    type: "string | JSXOutput | QRL<(data) => …>",
    description:
      "Description for the settled toast. A plain value is also shown while loading; a function runs once settled.",
  },
  {
    name: "finally",
    type: "QRL<() => void | Promise<void>>",
    description: "Runs after the promise settles, whatever the outcome.",
  },
  {
    name: "…options",
    type: "ExternalToast",
    description: "Any toast option (except `description`, above) — applied to the loading toast.",
  },
];

const RETURN_ROWS: PropRow[] = [
  {
    name: "toast(), .success(), …",
    type: "string | number",
    description: "The toast id — the one you passed as `id`, or an auto-incremented number.",
  },
  {
    name: "toast.custom()",
    type: "string | number",
    description: "The toast id; also passed to your render callback.",
  },
  {
    name: "toast.promise()",
    type: "(string | number) & { unwrap }",
    description:
      "The id with an `unwrap()` method that resolves/rejects like the original promise. Without `loading` only `{ unwrap }` is returned; without a second argument, `undefined`.",
  },
  {
    name: "toast.dismiss()",
    type: "string | number | undefined",
    description: "The id you passed, if any.",
  },
];

const createEvent = $(
  (): Promise<{ name: string }> =>
    new Promise((resolve) => setTimeout(() => resolve({ name: "Sonner" }), 2000)),
);

const failEvent = $(
  (): Promise<never> =>
    new Promise((_, reject) => setTimeout(() => reject(new Error("Network unreachable")), 1500)),
);

export default component$(() => {
  return (
    <>
      <h1>
        <code>toast()</code>
      </h1>
      <p class="lead">
        Create toasts from anywhere — event handlers, tasks, plain modules. The store is global, so
        no context or hook is needed; the <code>{"<Toaster />"}</code> picks them up.
      </p>

      <CodeBlock code={signatureCode} />
      <p>
        <code>message</code> is a <code>string</code>, JSX, or a function returning either. Every
        helper takes the same <Link href="/docs/v2/options/">options object</Link> as its last
        argument.
      </p>

      <H2 id="types">Types</H2>
      <Demo>
        <button class="button" onClick$={() => toast("Event has been created")}>
          Default
        </button>
        <button
          class="button"
          onClick$={() =>
            toast("Event has been created", { description: "Monday, January 3rd at 6:00pm" })
          }
        >
          Description
        </button>
        <button class="button" onClick$={() => toast.success("Event has been created")}>
          Success
        </button>
        <button
          class="button"
          onClick$={() => toast.info("Be at the area 10 minutes before the event time")}
        >
          Info
        </button>
        <button
          class="button"
          onClick$={() => toast.warning("Event start time cannot be earlier than 8am")}
        >
          Warning
        </button>
        <button class="button" onClick$={() => toast.error("Event has not been created")}>
          Error
        </button>
        <button class="button" onClick$={() => toast.loading("Creating event…")}>
          Loading
        </button>
      </Demo>
      <CodeBlock code={typesCode} />
      <p>
        <code>toast.loading()</code> has no timer: update it (see below) or dismiss it when the work
        is done.
      </p>

      <H2 id="action">Action and cancel</H2>
      <p>
        Add a primary <code>action</code> and/or a secondary <code>cancel</code> button. Handlers
        are QRLs. The toast closes after the click unless the action sets{" "}
        <code>preventDefault: true</code> — Qwik's take on sonner's{" "}
        <code>event.preventDefault()</code>.
      </p>
      <Demo>
        <button
          class="button"
          onClick$={() =>
            toast("Event has been created", {
              action: { label: "Undo", onClick$: $(() => toast.success("Change reverted")) },
            })
          }
        >
          Action
        </button>
        <button
          class="button"
          onClick$={() =>
            toast("Event has been created", {
              cancel: { label: "Cancel", onClick$: $(() => toast("Cancelled")) },
            })
          }
        >
          Cancel
        </button>
        <button
          class="button"
          onClick$={() =>
            toast("Keeps open after clicking", {
              action: {
                label: "Click me",
                preventDefault: true,
                onClick$: $(() => toast.info("Still here")),
              },
            })
          }
        >
          preventDefault
        </button>
      </Demo>
      <CodeBlock code={actionCode} />
      <p>
        Instead of an <code>Action</code> object you can pass any JSX as <code>action</code> or{" "}
        <code>cancel</code>; it renders as-is.
      </p>

      <H2 id="promise">Promise</H2>
      <p>
        <code>toast.promise()</code> shows a loading toast and turns it into a success or error
        toast when the promise settles. Pass a promise, or a function / QRL returning one.
      </p>
      <Demo>
        <button
          class="button"
          onClick$={() =>
            toast.promise(createEvent, {
              loading: "Creating event…",
              success: $((data: { name: string }) => `${data.name} has been created`),
              error: "Could not create the event",
            })
          }
        >
          Resolve
        </button>
        <button
          class="button"
          onClick$={() =>
            toast.promise(failEvent, {
              loading: "Creating event…",
              success: "Created",
              error: $((err: Error) => `Failed: ${err.message}`),
            })
          }
        >
          Reject
        </button>
      </Demo>
      <CodeBlock code={promiseCode} />
      <PropsTable rows={PROMISE_ROWS} firstColumn="Field" />
      <H3 id="promise-extended">Changing options on settle</H3>
      <p>
        Return an object with a <code>message</code> to change the settled toast's options too:
      </p>
      <CodeBlock code={extendedCode} />

      <H2 id="custom">Custom JSX</H2>
      <p>
        Pass JSX as the message to keep the default look, or use <code>toast.custom()</code> to
        render only your own markup — it drops the default toast styles but keeps stacking, swiping
        and timers.
      </p>
      <Demo>
        <button
          class="button"
          onClick$={() =>
            toast(
              <span>
                Signed in as <strong>diecodev</strong>
              </span>,
            )
          }
        >
          JSX message
        </button>
        <button
          class="button"
          onClick$={() =>
            toast.custom(
              (id) => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "356px",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    color: "#fff",
                    background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                    boxShadow: "0 10px 30px -10px rgba(79, 70, 229, 0.6)",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>✨</span>
                  <span style={{ flex: 1 }}>
                    <strong style={{ display: "block" }}>You've unlocked Pro</strong>
                    Unlimited toasts and custom themes.
                  </span>
                  <button
                    onClick$={() => toast.dismiss(id)}
                    style={{
                      padding: "5px 10px",
                      border: 0,
                      borderRadius: "6px",
                      background: "#fff",
                      color: "#4f46e5",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              ),
              { duration: Number.POSITIVE_INFINITY },
            )
          }
        >
          toast.custom
        </button>
      </Demo>
      <CodeBlock code={customCode} />

      <H2 id="update">Updating a toast</H2>
      <p>
        Call any helper with the <code>id</code> of an existing toast to update it in place.
      </p>
      <Demo>
        <button
          class="button"
          onClick$={() => {
            const id = toast.loading("Uploading…");
            setTimeout(() => toast.success("Upload complete", { id }), 1600);
          }}
        >
          Loading → success
        </button>
      </Demo>
      <CodeBlock code={updateCode} />

      <H2 id="dismiss">Dismissing</H2>
      <Demo>
        <button
          class="button"
          onClick$={() => {
            for (let i = 1; i <= 3; i++) toast(`Toast ${i}`, { duration: 10000 });
          }}
        >
          Show three
        </button>
        <button class="button" onClick$={() => toast.dismiss()}>
          Dismiss all
        </button>
      </Demo>
      <CodeBlock code={dismissCode} />
      <p>
        Use <code>onDismiss$</code> and <code>onAutoClose$</code> to react to a toast closing — see{" "}
        <Link href="/docs/v2/options/#callbacks">callbacks</Link>.
      </p>

      <H2 id="state">Reading state</H2>
      <CodeBlock code={stateCode} />
      <p>
        For a reactive list inside a component use{" "}
        <Link href="/docs/v2/advanced/#use-sonner">
          <code>useSonner()</code>
        </Link>
        .
      </p>

      <H2 id="returns">Return values</H2>
      <PropsTable rows={RETURN_ROWS} firstColumn="Call" />
      <Callout type="note">
        <p>
          Ids are compared with <code>===</code>, and <code>0</code> is treated as “no id” by{" "}
          <code>toast.dismiss(0)</code> (it dismisses every toast) — prefer non-zero ids or strings.
        </p>
      </Callout>
    </>
  );
});

export const head: DocumentHead = {
  title: "toast() — qwik-sonner",
  meta: [
    {
      name: "description",
      content: "Every toast helper: types, actions, promises, custom JSX, updating and dismissing.",
    },
  ],
  frontmatter: {
    toc: [
      { id: "types", title: "Types" },
      { id: "action", title: "Action and cancel" },
      { id: "promise", title: "Promise" },
      { id: "promise-extended", title: "Changing options on settle", level: 3 },
      { id: "custom", title: "Custom JSX" },
      { id: "update", title: "Updating a toast" },
      { id: "dismiss", title: "Dismissing" },
      { id: "state", title: "Reading state" },
      { id: "returns", title: "Return values" },
    ],
  },
};
