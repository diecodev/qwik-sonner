import { component$ } from "@qwik.dev/core";
import { Link, type DocumentHead } from "@qwik.dev/router";
import { CodeBlock } from "~/components/CodeBlock";
import { Callout, H2, InstallTabs } from "~/components/docs/ui";
import { VERSIONS } from "~/lib/versions";

const quickStartCode = `import { component$ } from "@builder.io/qwik";
import { Toaster, toast } from "qwik-sonner";

export default component$(() => {
  return (
    <div>
      <Toaster />
      <button onClick$={() => toast("My first toast")}>Give me a toast</button>
    </div>
  );
});`;

const entriesCode = `// Styled (default)
import { Toaster, toast } from "qwik-sonner";

// Headless — no styles
import { Toaster, toast } from "qwik-sonner/headless";`;

const typesCode = `toast("Event has been created");

toast("Event has been created", {
  description: "Monday, January 3rd at 6:00pm",
});

toast.success("Event has been created");
toast.info("Event has new information");
toast.warning("Event has warning");
toast.error("Event has not been created");
toast.loading("Loading…");`;

export default component$(() => {
  const v1 = VERSIONS.v1;

  return (
    <>
      <h1>Introduction</h1>
      <p class="lead">
        qwik-sonner {v1.version}: the toast component for Qwik 1 apps (<code>@builder.io/qwik</code>
        ), ported from sonner by Emil Kowalski.
      </p>

      <H2 id="installation">Installation</H2>
      <p>
        Install the 1.x line — the version range keeps you on Qwik 1 releases even after v2 becomes
        npm's <code>latest</code>:
      </p>
      <InstallTabs spec={v1.spec} />
      <p>
        Built and tested against Qwik 1.5 (<code>@builder.io/qwik</code>). It ships ESM and CommonJS
        builds.
      </p>

      <H2 id="quick-start">Quick start</H2>
      <p>
        Add <code>{"<Toaster />"}</code> to your app — it's where the toasts render — then call{" "}
        <code>toast()</code> from anywhere.
      </p>
      <CodeBlock code={quickStartCode} />
      <Callout type="warning" title="Render the Toaster before your content">
        <p>
          The v1 Toaster subscribes when it becomes visible. Place it at the beginning of where you
          use it so it's on screen early; otherwise toasts may not render (
          <a
            href="https://github.com/diecodev/qwik-sonner/issues/13"
            target="_blank"
            rel="noreferrer"
          >
            issue #13
          </a>
          ).
        </p>
      </Callout>

      <H2 id="types">Toast types</H2>
      <CodeBlock code={typesCode} />
      <p>
        Actions, promises, custom JSX and every option are in the{" "}
        <Link href="/docs/v1/api/">API reference</Link>.
      </p>

      <H2 id="entry-points">Styled or headless</H2>
      <CodeBlock code={entriesCode} />
      <p>
        Styling options are covered in <Link href="/docs/v1/styling/">Styling</Link>.
      </p>

      <H2 id="upgrade">Upgrading to Qwik 2</H2>
      <p>
        qwik-sonner 2 supports Qwik 2 and adds swipe directions, top-layer rendering, multiple
        toasters and more. Read the <Link href="/docs/migration/">migration guide</Link>.
      </p>
    </>
  );
});

export const head: DocumentHead = {
  title: "Introduction (v1) — qwik-sonner",
  meta: [
    { name: "description", content: "qwik-sonner 1.x for Qwik 1: installation and quick start." },
  ],
  frontmatter: {
    toc: [
      { id: "installation", title: "Installation" },
      { id: "quick-start", title: "Quick start" },
      { id: "types", title: "Toast types" },
      { id: "entry-points", title: "Styled or headless" },
      { id: "upgrade", title: "Upgrading to Qwik 2" },
    ],
  },
};
