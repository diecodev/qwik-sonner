import { component$ } from "@qwik.dev/core";
import { Link } from "@qwik.dev/router";
import { toast, Toaster, useSonner } from "qwik-sonner";

const ToastCounter = component$(() => {
  const { toasts } = useSonner();
  return <p data-testid="toast-count">{toasts.value.length}</p>;
});

export default component$(() => {
  return (
    <>
      <button data-testid="fire-toast" class="button" onClick$={() => toast("Navigated toast")}>
        Fire Toast
      </button>
      <Link href="/nav/" data-testid="back-link">
        Back
      </Link>
      <ToastCounter />
      <Toaster />
    </>
  );
});
