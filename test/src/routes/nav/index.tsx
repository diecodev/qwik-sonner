import { component$ } from "@qwik.dev/core";
import { Link } from "@qwik.dev/router";

// No `<Toaster>` here: the target page's Toaster is rendered on the client by
// the SPA navigation.
export default component$(() => {
  return (
    <Link href="/nav/target/" data-testid="nav-link">
      Go to the page with a Toaster
    </Link>
  );
});
