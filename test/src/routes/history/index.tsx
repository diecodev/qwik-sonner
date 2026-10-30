import { component$, useSignal } from "@qwik.dev/core";
import { toast } from "qwik-sonner";

// No `<Toaster>`: only the toast history (`toast.getHistory()`) matters here.
export default component$(() => {
  const historyLength = useSignal<number | null>(null);

  return (
    <>
      <button
        data-testid="overflow-history"
        class="button"
        onClick$={() => {
          for (let i = 0; i < 120; i++) toast(`Toast ${i}`);
          toast.dismiss();
          toast("After");
          historyLength.value = toast.getHistory().length;
        }}
      >
        Create 120 toasts, dismiss them, create one more
      </button>
      {historyLength.value !== null && <p data-testid="history-length">{historyLength.value}</p>}
    </>
  );
});
