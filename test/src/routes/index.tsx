import { component$, useSignal, $ } from "@builder.io/qwik";
import { useLocation, type DocumentHead } from "@builder.io/qwik-city";
import { toast, Toaster } from "qwik-sonner";

const promise = $(
  () =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ name: "Sonner" }), 2000)
    )
);

export default component$(() => {
  const params = useLocation().url.searchParams;

  const theme = useSignal<"light" | "dark">(
    (params.get("theme") as any) ?? "light"
  );
  const isFinally = useSignal<boolean>(false);
  const showAutoClose = useSignal<boolean>(false);
  const showDismiss = useSignal<boolean>(false);

  const position = (params.get("position") as any) ?? "bottom-right";
  const dir = (params.get("dir") as any) ?? "auto";

  return (
    <>
      <button
        data-testid="theme-button"
        class="button"
        onClick$={() =>
          (theme.value = theme.value === "light" ? "dark" : "light")
        }
      >
        Change theme
      </button>
      <button
        data-testid="default-button"
        class="button"
        onClick$={() => toast("My Toast")}
      >
        Render Toast
      </button>
      <button
        data-testid="default-button-top"
        class="button"
        onClick$={() => toast("My Toast")}
      >
        Render Toast Top
      </button>
      <button
        data-testid="success"
        class="button"
        onClick$={() => toast.success("My Success Toast")}
      >
        Render Success Toast
      </button>
      <button
        data-testid="error"
        class="button"
        onClick$={() => toast.error("My Error Toast")}
      >
        Render Error Toast
      </button>
      <button
        data-testid="action"
        class="button"
        onClick$={() =>
          toast("My Message", {
            action: {
              label: "Action",
              onClick: $(() => console.log("Action")),
            },
          })
        }
      >
        Render Action Toast
      </button>
      <button
        data-testid="action-prevent"
        class="button"
        onClick$={() =>
          toast("My Message", {
            action: {
              label: "Action",
              onClick: $((event) => {
                event.preventDefault();
                console.log("Action");
              }),
            },
          })
        }
      >
        Render Action Toast
      </button>
      <button
        data-testid="promise"
        data-finally={isFinally.value ? "1" : "0"}
        class="button"
        onClick$={() =>
          toast.promise(promise, {
            loading: "Loading...",
            success: "Loaded",
            error: "Error",
            finally: $(() => {
              isFinally.value = true;
            }),
          })
        }
      >
        Render Promise Toast
      </button>
      <button
        data-testid="custom"
        class="button"
        onClick$={() =>
          toast.custom((t) => (
            <div>
              <h1>jsx</h1>
              <button
                data-testid="dismiss-button"
                onClick$={() => toast.dismiss(t)}
              >
                Dismiss
              </button>
            </div>
          ))
        }
      >
        Render Custom Toast
      </button>
      <button
        data-testid="custom-cancel-button-toast"
        class="button"
        onClick$={() =>
          toast("My Custom Cancel Button", {
            cancel: {
              label: "Cancel",
              onClick: $(() => console.log("Cancel")),
            },
          })
        }
      >
        Render Custom Cancel Button
      </button>
      <button
        data-testid="infinity-toast"
        class="button"
        onClick$={() => toast("My Toast", { duration: Infinity })}
      >
        Render Infinity Toast
      </button>
      <button
        data-testid="auto-close-toast-callback"
        class="button"
        onClick$={() =>
          toast("My Toast", {
            onAutoClose: $(() => {
              showAutoClose.value = true;
            }),
          })
        }
      >
        Render Toast With onAutoClose callback
      </button>
      <button
        data-testid="dismiss-toast-callback"
        class="button"
        onClick$={() =>
          toast("My Toast", {
            onDismiss: $(() => {
              showDismiss.value = true;
            }),
          })
        }
      >
        Render Toast With onAutoClose callback
      </button>
      <button
        data-testid="non-dismissible-toast"
        class="button"
        onClick$={() =>
          toast("My Toast", {
            dismissible: false,
          })
        }
      >
        Non-dismissible Toast
      </button>
      <button
        data-testid="update-toast"
        class="button"
        onClick$={() => {
          const toastId = toast("My Unupdated Toast", {
            duration: 10000,
          });
          toast("My Updated Toast", {
            id: toastId,
            duration: 10000,
          });
        }}
      >
        Updated Toast
      </button>
      <button
        data-testid="string-description"
        class="button"
        onClick$={() =>
          toast("Custom Description", { description: "string description" })
        }
      >
        String Description
      </button>
      <button
        data-testid="react-node-description"
        class="button"
        onClick$={() =>
          toast("Custom Description", {
            description: <div>This is my custom ReactNode description</div>,
          })
        }
      >
        ReactNode Description
      </button>
      {showAutoClose.value ? <div data-testid="auto-close-el" /> : null}
      {showDismiss.value ? <div data-testid="dismiss-el" /> : null}
      <Toaster
        position={position}
        toastOptions={{
          actionButtonStyle: { backgroundColor: "rgb(219, 239, 255)" },
          cancelButtonStyle: { backgroundColor: "rgb(254, 226, 226)" },
        }}
        theme={theme.value}
        dir={dir}
      />
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
