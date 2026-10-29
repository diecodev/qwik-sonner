import { component$, useSignal } from "@qwik.dev/core";
import { useLocation } from "@qwik.dev/router";
import { toast, Toaster } from "qwik-sonner";

/**
 * The `<Toaster>` sits behind a signal, so it is first rendered on the client
 * (never during SSR) and can't rely on the SSR-only `qinit` subscription.
 */
export default component$(() => {
  const topLayer = useLocation().url.searchParams.get("topLayer") === "1";
  const show = useSignal(false);

  return (
    <>
      <button
        data-testid="toggle-toaster"
        class="button"
        onClick$={() => (show.value = !show.value)}
      >
        Toggle Toaster
      </button>
      <button data-testid="fire-toast" class="button" onClick$={() => toast("Client toast")}>
        Fire Toast
      </button>
      {show.value && <Toaster topLayer={topLayer} />}
    </>
  );
});
