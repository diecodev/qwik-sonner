import { $, component$ } from "@qwik.dev/core";
import { toast, Toaster } from "qwik-sonner";

/** Behaviour sonner 2.0.8 changed since 2.0.7. */
export default component$(() => {
  return (
    <>
      <button
        data-testid="action-toast"
        class="button"
        onClick$={() =>
          toast.success("Original", {
            id: "same",
            duration: Infinity,
            action: { label: "Undo", onClick$: $(() => {}) },
          })
        }
      >
        Toast with an action
      </button>
      <button data-testid="dismiss-same" class="button" onClick$={() => toast.dismiss("same")}>
        Dismiss it
      </button>
      <button
        data-testid="dismiss-and-recreate"
        class="button"
        onClick$={() => {
          toast.dismiss("same");
          toast.success("Recreated", { id: "same", duration: Infinity });
        }}
      >
        Dismiss and re-create it at once
      </button>
      <button
        data-testid="recreate"
        class="button"
        onClick$={() => toast.success("Fresh", { id: "same", duration: Infinity })}
      >
        Re-create it
      </button>
      <button
        data-testid="loading-then-plain"
        class="button"
        onClick$={() => {
          const id = toast.loading("Loading");
          toast("Done", { id, duration: Infinity });
        }}
      >
        Loading toast, then a plain one with its id
      </button>
      <button
        data-testid="loading-then-custom"
        class="button"
        onClick$={() => {
          const id = toast.loading("Loading");
          toast.custom(() => <div data-testid="custom-replacement">Custom</div>, {
            id,
            duration: Infinity,
          });
        }}
      >
        Loading toast, then a custom one with its id
      </button>
      <button
        data-testid="loading-with-icon"
        class="button"
        onClick$={() =>
          toast.loading("Loading with icon", {
            icon: <span data-testid="custom-loading-icon">…</span>,
          })
        }
      >
        Loading toast with a custom icon
      </button>
      <button
        data-testid="plain-toast"
        class="button"
        onClick$={() => toast("Plain toast", { duration: Infinity })}
      >
        Plain toast
      </button>
      <button
        data-testid="success-toast"
        class="button"
        onClick$={() => toast.success("Success toast", { duration: Infinity })}
      >
        Success toast
      </button>
      <button
        data-testid="close-button-toast"
        class="button"
        onClick$={() => toast("Closable toast", { closeButton: true, duration: Infinity })}
      >
        Toast with a close button
      </button>
      <Toaster toastOptions={{ classes: { default: "default-class" } }} />
    </>
  );
});
