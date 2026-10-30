import { component$ } from "@qwik.dev/core";
import { toast, Toaster } from "qwik-sonner";

/** Toasts with the id `0`, which is falsy but still an id. */
export default component$(() => {
  return (
    <>
      <button
        data-testid="zero-toast"
        class="button"
        onClick$={() => toast("Zero toast", { id: 0, duration: Infinity })}
      >
        Toast with id 0
      </button>
      <button
        data-testid="zero-toast-update"
        class="button"
        onClick$={() => toast("Zero toast updated", { id: 0, duration: Infinity })}
      >
        Update the toast with id 0
      </button>
      <button
        data-testid="other-toast"
        class="button"
        onClick$={() => toast("Other toast", { duration: Infinity })}
      >
        Toast with a generated id
      </button>
      <button
        data-testid="custom-zero"
        class="button"
        onClick$={() =>
          toast.custom((id) => <div data-testid="custom-zero-toast">Custom toast {id}</div>, {
            id: 0,
            duration: Infinity,
          })
        }
      >
        Custom toast with id 0
      </button>
      <button data-testid="dismiss-zero" class="button" onClick$={() => toast.dismiss(0)}>
        Dismiss id 0
      </button>
      <Toaster />
    </>
  );
});
