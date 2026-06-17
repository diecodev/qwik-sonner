import { component$, useSignal, $ } from "@qwik.dev/core";
import { useLocation, type DocumentHead } from "@qwik.dev/router";
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
  const showAriaLabels = useSignal<boolean>(false);
  const unwrapError = useSignal<string>("");

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
              onClick$: $(() => console.log("Action")),
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
              onClick$: $(() => {
                console.log("Action");
              }),
              preventDefault: true,
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
        data-testid="extended-promise"
        class="button"
        onClick$={() =>
          toast.promise(
            new Promise((resolve) => {
              setTimeout(() => resolve({ name: "Sonner" }), 2000);
            }),
            {
              loading: "Loading...",
              success: $((data: any) => ({
                message: `${data.name} toast has been added`,
                description: "Custom description for the Success state",
              })),
              error: {
                message: "An error occurred",
                action: {
                  label: "Retry",
                  onClick$: $(() => console.log("retrying")),
                },
              },
              description: "Global description",
            }
          )
        }
      >
        Extended Promise Toast
      </button>
      <button
        data-testid="extended-promise-error"
        class="button"
        onClick$={() =>
          toast.promise(
            new Promise((_, reject) => {
              setTimeout(() => reject(new Error("Simulated error")), 2000);
            }),
            {
              loading: "Loading...",
              success: $((data: any) => ({
                message: `${data.name} toast has been added`,
                description: "Custom description for the Success state",
              })),
              error: {
                message: "An error occurred",
                action: {
                  label: "Retry",
                  onClick$: $(() => console.log("retrying")),
                  preventDefault: true,
                },
              },
              description: "Global description",
            }
          )
        }
      >
        Extended Promise Error Toast
      </button>
      <button
        data-testid="error-promise"
        class="button"
        onClick$={() => {
          const whatWillHappen = $(async () => {
            throw new Error("Not implemented");
          });

          toast.promise(whatWillHappen, {
            loading: "Saving project...",
            success: $((result: any) =>
              result?.ok ? "Project saved" : `${result?.error}`
            ),
            error: $((e: any) => `Error Raise: ${e}`),
          });
        }}
      >
        Error Promise Toast
      </button>
      <button
        data-testid="unwrap-reject"
        class="button"
        onClick$={async () => {
          const rejected = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Promise rejected")), 100)
          );
          try {
            await toast.promise(rejected, {})?.unwrap();
          } catch (e) {
            unwrapError.value = (e as Error).message;
          }
        }}
      >
        Unwrap Rejecting Promise
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
        data-testid="custom-with-empty-id"
        class="button"
        onClick$={() =>
          toast.custom(
            (t) => (
              <div>
                <h1>jsx</h1>
                <button data-dismiss onClick$={() => toast.dismiss(t)}>
                  Dismiss
                </button>
              </div>
            ),
            { id: undefined }
          )
        }
      >
        Render Custom Toast with empty id
      </button>
      <button
        data-testid="custom-cancel-button-toast"
        class="button"
        onClick$={() =>
          toast("My Custom Cancel Button", {
            cancel: {
              label: "Cancel",
              onClick$: $(() => console.log("Cancel")),
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
            onAutoClose$: $(() => {
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
            onDismiss$: $(() => {
              showDismiss.value = true;
            }),
          })
        }
      >
        Dismiss toast callback
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
        data-testid="update-toast-duration"
        class="button"
        onClick$={() => {
          const toastId = toast("My Unupdated Toast, Updated After 3 Seconds", {
            duration: 10000,
          });
          setTimeout(() => {
            toast("My Updated Toast, Close After 1 Second", {
              id: toastId,
              duration: 1000,
            });
          }, 3000);
        }}
      >
        Updated Toast Duration
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
      <button
        class="button"
        onClick$={() => {
          showAriaLabels.value = true;
          toast("Toast with custom ARIA labels", {
            closeButton: true,
            onAutoClose$: $(() => {
              showAriaLabels.value = false;
            }),
          });
        }}
      >
        With custom ARIA labels
      </button>
      <button
        data-testid="toast-secondary"
        class="button"
        onClick$={() =>
          toast("Secondary Toaster Toast", { toasterId: "secondary" })
        }
      >
        Render Toast in Secondary Toaster
      </button>
      <button
        data-testid="toast-global"
        class="button"
        onClick$={() => toast("Global Toaster Toast")}
      >
        Render Toast in Global Toaster
      </button>
      <button
        data-testid="testid-toast-button"
        class="button"
        onClick$={() =>
          toast("Toast with test ID", { testId: "my-test-toast" })
        }
      >
        Toast with testId
      </button>
      <button
        data-testid="testid-promise-toast-button"
        class="button"
        onClick$={() =>
          toast.promise(promise, {
            loading: "Loading...",
            success: "Loaded",
            error: "Error",
            testId: "promise-test-toast",
          })
        }
      >
        Promise Toast with testId
      </button>
      {showAutoClose.value ? <div data-testid="auto-close-el" /> : null}
      {showDismiss.value ? <div data-testid="dismiss-el" /> : null}
      {unwrapError.value ? (
        <div data-testid="unwrap-error">{unwrapError.value}</div>
      ) : null}
      <Toaster
        position={position}
        toastOptions={{
          actionButtonStyle: { backgroundColor: "rgb(219, 239, 255)" },
          cancelButtonStyle: { backgroundColor: "rgb(254, 226, 226)" },
          closeButtonAriaLabel: showAriaLabels.value
            ? "Yeet the notice"
            : undefined,
        }}
        theme={theme.value}
        dir={dir}
        containerAriaLabel={showAriaLabels.value ? "Notices" : undefined}
      />
      <Toaster
        id="secondary"
        position="top-left"
        toastOptions={{ class: "secondary-toaster" }}
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
