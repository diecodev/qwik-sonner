import { $, component$, useSignal } from "@qwik.dev/core";
import { type DocumentHead } from "@qwik.dev/router";
import { toast, useSonner } from "qwik-sonner";
import { CodeBlock } from "~/components/CodeBlock";
import { Callout, Demo, H2 } from "~/components/docs/ui";
import { SECONDARY_TOASTER } from "~/lib/toaster-context";
import styles from "../../pages.module.css";
import ex from "./examples.module.css";

/* Undo ------------------------------------------------------------------- */

const INITIAL_MAIL = ["Design review notes", "Invoice #2026-104", "Weekly digest"];

const undoCode = `const remove = $((item: string) => {
  items.value = items.value.filter((i) => i !== item);

  toast("Conversation archived", {
    description: item,
    action: {
      label: "Undo",
      onClick$: $(() => (items.value = [...items.value, item])),
    },
  });
});`;

const UndoDemo = component$(() => {
  const items = useSignal<string[]>(INITIAL_MAIL);

  return (
    <div class={ex.inbox}>
      {items.value.length === 0 ? (
        <div class={ex.empty}>
          Inbox zero.{" "}
          <button class={ex.linkButton} onClick$={() => (items.value = INITIAL_MAIL)}>
            Restore
          </button>
        </div>
      ) : (
        items.value.map((item) => (
          <div key={item} class={ex.mail}>
            <span>{item}</span>
            <button
              class="button"
              onClick$={() => {
                items.value = items.value.filter((i) => i !== item);
                toast("Conversation archived", {
                  description: item,
                  action: {
                    label: "Undo",
                    onClick$: $(() => {
                      if (!items.value.includes(item)) items.value = [...items.value, item];
                    }),
                  },
                });
              }}
            >
              Archive
            </button>
          </div>
        ))
      )}
    </div>
  );
});

/* Form submission -------------------------------------------------------- */

const subscribe = $(
  (email: string): Promise<{ email: string }> =>
    new Promise((resolve, reject) =>
      setTimeout(
        () =>
          email.includes("@")
            ? resolve({ email })
            : reject(new Error("That doesn't look like an email address")),
        1200,
      ),
    ),
);

const formCode = `<form
  preventdefault:submit
  onSubmit$={async (_, form) => {
    const email = new FormData(form).get("email") as string;

    const result = toast.promise(subscribe(email), {
      loading: "Subscribing…",
      success: $((data: { email: string }) => \`\${data.email} is on the list\`),
      error: $((err: Error) => err.message),
    });

    // unwrap() resolves/rejects like the original promise
    try {
      await result?.unwrap();
      form.reset();
    } catch {
      // the error toast is already showing
    }
  }}
>`;

const FormDemo = component$(() => {
  return (
    <form
      class={ex.form}
      preventdefault:submit
      onSubmit$={async (_, form) => {
        const email = String(new FormData(form).get("email") ?? "");
        const result = toast.promise(subscribe(email), {
          loading: "Subscribing…",
          success: $((data: { email: string }) => `${data.email} is on the list`),
          error: $((err: Error) => err.message),
        });
        try {
          await result?.unwrap();
          form.reset();
        } catch {
          // The error toast is already showing.
        }
      }}
    >
      <input
        class={ex.input}
        name="email"
        placeholder="you@example.com"
        autoComplete="off"
        aria-label="Email"
      />
      <button class="button" type="submit">
        Subscribe
      </button>
    </form>
  );
});

/* Progress --------------------------------------------------------------- */

const progressCode = `const id = toast.loading("Uploading report.pdf", { description: "0%" });

for (let p = 0; p <= 100; p += 20) {
  await new Promise((r) => setTimeout(r, 400));
  toast.loading("Uploading report.pdf", { id, description: \`\${p}%\` });
}

toast.success("report.pdf uploaded", { id, description: "2.4 MB" });`;

/* Server actions ---------------------------------------------------------- */

const actionCode = `import { component$, isServer, useTask$ } from "@qwik.dev/core";
import { Form, routeAction$ } from "@qwik.dev/router";
import { toast } from "qwik-sonner";

export const useSaveProfile = routeAction$(async (data) => {
  // …persist
  return { ok: true, name: data.name as string };
});

export default component$(() => {
  const action = useSaveProfile();

  useTask$(({ track }) => {
    const result = track(() => action.value);
    // The toast store is module-global: never create toasts during SSR.
    if (!result || isServer) return;
    if (result.ok) toast.success(\`Saved \${result.name}\`);
    else toast.error("Could not save your profile");
  });

  return <Form action={action}>{/* fields */}</Form>;
});`;

/* Fetch ----------------------------------------------------------------- */

const fetchCode = `toast.promise(fetch("/api/report"), {
  loading: "Generating report…",
  success: "Report ready",
  // A Response with ok: false lands here with "HTTP error! status: 500"
  error: $((message: string) => message),
});`;

/* Dialog ----------------------------------------------------------------- */

const dialogCode = `// A second Toaster, promoted to the top layer
<Toaster id="over-modals" position="top-center" topLayer />

// Inside the <dialog>
toast.success("Saved", { toasterId: "over-modals" });`;

const DialogDemo = component$(() => {
  const dialog = useSignal<HTMLDialogElement>();

  return (
    <>
      <button
        class="button"
        onClick$={() => {
          // Workaround for 2.0.0-beta.1 (see Advanced → Known issues): a
          // topLayer Toaster also opens its popover for other Toasters' toasts
          // and never closes it, which would leave it beneath the modal.
          // Closing it lets the next toast re-open it above the dialog.
          document
            .querySelectorAll<HTMLElement>("[data-sonner-toaster-popover]:popover-open")
            .forEach((el) => el.hidePopover());
          dialog.value?.showModal();
        }}
      >
        Open dialog
      </button>
      <dialog ref={dialog} class={styles.dialog}>
        <h3>Edit event</h3>
        <p>A native modal dialog paints above every z-index — except the top layer.</p>
        <div class="buttons">
          <button
            class="button"
            onClick$={() =>
              toast.success("Saved — visible above the dialog", { toasterId: SECONDARY_TOASTER })
            }
          >
            Toast with topLayer
          </button>
          <button class="button" onClick$={() => toast("This one is hidden behind the dialog")}>
            Toast without
          </button>
          <button class="button" onClick$={() => dialog.value?.close()}>
            Close
          </button>
        </div>
      </dialog>
    </>
  );
});

/* Counter ----------------------------------------------------------------- */

const counterCode = `import { component$ } from "@qwik.dev/core";
import { useSonner } from "qwik-sonner";

export const ToastCounter = component$(() => {
  const { toasts } = useSonner();
  return <span>{toasts.value.length} on screen</span>;
});`;

const ToastCounter = component$(() => {
  const { toasts } = useSonner();
  return (
    <span class={styles.counter}>
      Toasts on screen
      <span class={styles.counterValue}>{toasts.value.length}</span>
    </span>
  );
});

/* Theme -------------------------------------------------------------------- */

const themeCode = `export default component$(() => {
  const theme = useSignal<"light" | "dark">("light");

  return (
    <>
      <Toaster theme={theme} />
      <button onClick$={() => (theme.value = theme.value === "dark" ? "light" : "dark")}>
        Toggle theme
      </button>
      <Slot />
    </>
  );
});`;

export default component$(() => {
  return (
    <>
      <h1>Examples</h1>
      <p class="lead">
        Real-world patterns, each one live. Copy the snippet next to it — they only use the public
        API.
      </p>

      <H2 id="undo">Undo a destructive action</H2>
      <p>
        Apply the change immediately and offer a way back, instead of asking for confirmation first.
      </p>
      <UndoDemo />
      <CodeBlock code={undoCode} />

      <H2 id="form">Submitting a form</H2>
      <p>
        <code>toast.promise</code> narrates the request; <code>unwrap()</code> lets the handler
        continue with the result. Try an address without <code>@</code>.
      </p>
      <Demo>
        <FormDemo />
      </Demo>
      <CodeBlock code={formCode} />

      <H2 id="progress">Reporting progress</H2>
      <p>Update a loading toast by id as work advances, then settle it.</p>
      <Demo>
        <button
          class="button"
          onClick$={async () => {
            const id = toast.loading("Uploading report.pdf", { description: "0%" });
            for (let p = 20; p <= 100; p += 20) {
              await new Promise((r) => setTimeout(r, 400));
              toast.loading("Uploading report.pdf", { id, description: `${p}%` });
            }
            toast.success("report.pdf uploaded", { id, description: "2.4 MB" });
          }}
        >
          Upload a file
        </button>
      </Demo>
      <CodeBlock code={progressCode} />

      <H2 id="server-actions">Server action results</H2>
      <p>
        React to a <code>routeAction$</code> result in a task, guarded with <code>isServer</code>:
        the toast store is a module-level singleton, so a toast created while rendering on the
        server would never reach the browser.
      </p>
      <CodeBlock code={actionCode} />

      <H2 id="fetch">Fetch requests</H2>
      <p>
        A <code>Response</code> that isn't <code>ok</code> becomes an error toast automatically — no
        need to throw yourself.
      </p>
      <CodeBlock code={fetchCode} />

      <H2 id="dialog">Above a modal dialog</H2>
      <p>
        <code>{"<dialog>.showModal()"}</code> lives in the browser's top layer, above any z-index. A
        Toaster with <code>topLayer</code> joins it there.
      </p>
      <Demo hint="The demo closes the top-layer container before opening the dialog — a workaround for a known issue in 2.0.0-beta.1.">
        <DialogDemo />
      </Demo>
      <CodeBlock code={dialogCode} />

      <H2 id="multiple">Several toasters</H2>
      <p>
        Route toasts to a named Toaster with <code>toasterId</code> — for example a top-center one
        for global announcements next to the default corner.
      </p>
      <Demo>
        <button
          class="button"
          onClick$={() =>
            toast.info("Maintenance tonight at 22:00 UTC", { toasterId: SECONDARY_TOASTER })
          }
        >
          Announcement (secondary)
        </button>
        <button class="button" onClick$={() => toast("Message sent")}>
          Regular (default)
        </button>
      </Demo>
      <CodeBlock
        code={`<Toaster />
<Toaster id="announcements" position="top-center" />

toast.info("Maintenance tonight", { toasterId: "announcements" });`}
      />

      <H2 id="counter">Live toast counter</H2>
      <Demo hint="In 2.0.0-beta.1 the counter only subscribes after a full page load — reload if you navigated here (see known issues).">
        <ToastCounter />
        <button class="button" onClick$={() => toast("Another one")}>
          Add a toast
        </button>
      </Demo>
      <CodeBlock code={counterCode} />

      <H2 id="theme">Following your app's theme</H2>
      <p>
        Pass a <code>Signal</code> to <code>theme</code> and flip it with the rest of your UI — this
        site does exactly that with its theme switch.
      </p>
      <CodeBlock code={themeCode} />
      <Callout type="note">
        <p>
          <code>theme="system"</code> follows the OS setting on its own, including changes while the
          page is open.
        </p>
      </Callout>
    </>
  );
});

export const head: DocumentHead = {
  title: "Examples — qwik-sonner",
  meta: [
    {
      name: "description",
      content:
        "Live qwik-sonner patterns: undo, forms with toast.promise, progress, server actions, dialogs and more.",
    },
  ],
  frontmatter: {
    toc: [
      { id: "undo", title: "Undo a destructive action" },
      { id: "form", title: "Submitting a form" },
      { id: "progress", title: "Reporting progress" },
      { id: "server-actions", title: "Server action results" },
      { id: "fetch", title: "Fetch requests" },
      { id: "dialog", title: "Above a modal dialog" },
      { id: "multiple", title: "Several toasters" },
      { id: "counter", title: "Live toast counter" },
      { id: "theme", title: "Following your app's theme" },
    ],
  },
};
