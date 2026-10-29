import { component$ } from "@qwik.dev/core";
import { toast, Toaster } from "qwik-sonner";

/**
 * Two Toasters: the default one, and one with an `id` promoted to the top layer.
 * Each must only react to its own toasts.
 */
export default component$(() => {
  return (
    <>
      <button
        data-testid="fire-default"
        class="button"
        onClick$={() => toast("Default Toaster toast")}
      >
        Toast in the default Toaster
      </button>
      <button
        data-testid="fire-layer"
        class="button"
        onClick$={() => toast("Top-layer Toaster toast", { toasterId: "layer" })}
      >
        Toast in the top-layer Toaster
      </button>
      <Toaster />
      {/* Away from the buttons: a toast under the pointer pauses its timer. */}
      <Toaster id="layer" topLayer position="bottom-left" />
    </>
  );
});
