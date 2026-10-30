import { $, component$, useOnDocument } from "@qwik.dev/core";
import { toast, Toaster } from "qwik-sonner";

// Fires a toast on `qinit`. It sits before the `<Toaster>` in the DOM, so the
// qwikloader runs this handler first: the toast is published before the
// Toaster has subscribed (the same race a click right after load hits on
// Qwik >= beta.45, where `qinit` no longer runs in the loader's serial queue).
const EarlyToast = component$(() => {
  useOnDocument(
    "qinit",
    $(() => {
      toast("Early toast");
    }),
  );

  return <p>A toast is fired as soon as the page initializes.</p>;
});

export default component$(() => {
  return (
    <>
      <EarlyToast />
      <Toaster />
    </>
  );
});
