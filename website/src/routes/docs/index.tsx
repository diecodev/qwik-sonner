import { component$ } from "@qwik.dev/core";
import type { DocumentHead, RequestHandler } from "@qwik.dev/router";
import { Link } from "@qwik.dev/router";
import { CURRENT_VERSION, VERSIONS } from "~/lib/versions";

const target = `${VERSIONS[CURRENT_VERSION].basePath}/`;

// `/docs` always means "the newest docs".
export const onGet: RequestHandler = ({ redirect }) => {
  throw redirect(308, target);
};

// Fallback page, should a request ever reach the route itself.
export default component$(() => (
  <p style={{ padding: "48px 24px", textAlign: "center" }}>
    The documentation moved to <Link href={target}>{target}</Link>.
  </p>
));

export const head: DocumentHead = {
  title: "Documentation — qwik-sonner",
  meta: [{ httpEquiv: "refresh", content: `0; url=${target}` }],
};
