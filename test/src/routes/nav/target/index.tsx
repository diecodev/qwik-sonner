import { component$ } from "@qwik.dev/core";
import { Link } from "@qwik.dev/router";
import { toast, Toaster } from "qwik-sonner";

export default component$(() => {
  return (
    <>
      <button data-testid="fire-toast" class="button" onClick$={() => toast("Navigated toast")}>
        Fire Toast
      </button>
      <Link href="/nav/" data-testid="back-link">
        Back
      </Link>
      <Toaster />
    </>
  );
});
