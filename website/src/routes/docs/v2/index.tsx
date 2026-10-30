import { $, component$ } from "@qwik.dev/core";
import { Link, type DocumentHead } from "@qwik.dev/router";
import { toast } from "qwik-sonner";
import { CodeBlock } from "~/components/CodeBlock";
import { QwikV2Badge } from "~/components/QwikV2Badge";
import { Callout, Demo, H2, InstallTabs } from "~/components/docs/ui";
import { LATEST, majorOf } from "~/lib/release";
import { VERSIONS } from "~/lib/versions";
import styles from "../pages.module.css";

const layoutCode = `import { component$, Slot } from "@qwik.dev/core";
import { Toaster } from "qwik-sonner";

export default component$(() => {
  return (
    <>
      <Toaster />
      <Slot />
    </>
  );
});`;

const pageCode = `import { component$ } from "@qwik.dev/core";
import { toast } from "qwik-sonner";

export default component$(() => {
  return (
    <button onClick$={() => toast("My first toast")}>
      Give me a toast
    </button>
  );
});`;

const entriesCode = `// Styled (default) — ships sonner's stylesheet via useStyles$
import { Toaster, toast } from "qwik-sonner";

// Headless — same API and markup, no styles
import { Toaster, toast } from "qwik-sonner/headless";`;

const undo = $(() => {
  toast.success("Change reverted");
});

export default component$(() => {
  const v2 = VERSIONS.v2;
  const v1 = VERSIONS.v1;
  // A plain `npm install qwik-sonner` still gets the Qwik 1 line.
  const latestIsV1 = LATEST !== null && majorOf(LATEST) === 1;

  return (
    <>
      <h1>Introduction</h1>
      <p class="lead">
        An opinionated toast component for Qwik. A resumable port of{" "}
        <a href="https://sonner.emilkowal.ski/" target="_blank" rel="noreferrer">
          sonner
        </a>{" "}
        by Emil Kowalski: render one <code>{"<Toaster />"}</code>, call <code>toast()</code> from
        anywhere, ship zero hydration.
      </p>

      <Demo hint="Every button on these pages fires a real toast.">
        <button
          class="button"
          onClick$={() =>
            toast("Event has been created", { description: "Monday, January 3rd at 6:00pm" })
          }
        >
          Render a toast
        </button>
        <button class="button" onClick$={() => toast.success("Event has been created")}>
          Success
        </button>
        <button class="button" onClick$={() => toast.error("Event has not been created")}>
          Error
        </button>
        <button
          class="button"
          onClick$={() =>
            toast("Event has been created", {
              action: { label: "Undo", onClick$: undo },
            })
          }
        >
          With action
        </button>
      </Demo>

      <H2 id="installation">Installation</H2>
      <p>
        Version 2 targets Qwik 2: <code>@qwik.dev/core</code> 2.0.0-rc.4 or later.
        {v2.prerelease ? (
          <>
            {" "}
            While it's a pre-release it's published under the <code>{v2.tag}</code> dist-tag, so
            name the tag explicitly:
          </>
        ) : null}
      </p>
      <InstallTabs spec={v2.spec} />
      <div class={styles.statusRow}>
        <span>Release status on npm</span>
        <QwikV2Badge />
      </div>
      <Callout type="warning" title="Using Qwik 1?">
        <p>
          <code>@builder.io/qwik</code> apps need qwik-sonner 1.x: install <code>{v1.spec}</code>
          {latestIsV1 ? (
            <>
              {" "}
              (also what a plain <code>npm install qwik-sonner</code> gives you today)
            </>
          ) : null}
          . See the <Link href="/docs/v1/">v1 documentation</Link>, or the{" "}
          <Link href="/docs/v2/migration/">migration guide</Link> when you move to Qwik 2.
        </p>
      </Callout>

      <H2 id="quick-start">Quick start</H2>
      <p>
        Render the <code>Toaster</code> once, in your root layout, then call <code>toast()</code>{" "}
        from any component.
      </p>
      <CodeBlock title="src/routes/layout.tsx" code={layoutCode} />
      <CodeBlock title="src/routes/index.tsx" code={pageCode} />

      <H2 id="entry-points">Styled or headless</H2>
      <p>
        The default entry injects sonner's stylesheet. <code>qwik-sonner/headless</code> renders the
        exact same markup and <code>data-sonner-*</code> attributes without any CSS, for when you
        want to own the look entirely.
      </p>
      <CodeBlock code={entriesCode} />

      <H2 id="differences">Differences from sonner</H2>
      <p>
        The API mirrors sonner as closely as Qwik's resumability allows. What changes is how
        functions cross the server/client boundary:
      </p>
      <div class={styles.compare}>
        <div class={styles.compareHead}>sonner (React)</div>
        <div class={styles.compareHead}>qwik-sonner</div>
        <code>onClick: () =&gt; …</code>
        <code>onClick$: $(() =&gt; …)</code>
        <code>onDismiss / onAutoClose</code>
        <code>onDismiss$ / onAutoClose$</code>
        <code>event.preventDefault()</code>
        <code>action.preventDefault: true</code>
        <code>className / classNames</code>
        <code>class / classes</code>
        <code>Re-render with new props</code>
        <code>{"position={signal}"}</code>
      </div>
      <p>
        Callbacks stored on a toast must be QRLs — wrap them in <code>$()</code>. Toaster props that
        should change after the page loaded (<code>position</code>, <code>theme</code>,{" "}
        <code>richColors</code>, <code>dir</code>, <code>invert</code>) accept a <code>Signal</code>
        .
      </p>

      <H2 id="next">Next steps</H2>
      <div class={styles.cards}>
        <Link href="/docs/v2/toast/" class={styles.card}>
          <strong>toast()</strong>
          <span>Every way to create, update and dismiss toasts.</span>
        </Link>
        <Link href="/docs/v2/toaster/" class={styles.card}>
          <strong>{"<Toaster />"}</strong>
          <span>Position, theme, stacking and every prop.</span>
        </Link>
        <Link href="/docs/v2/examples/" class={styles.card}>
          <strong>Examples</strong>
          <span>Undo, forms, uploads, dialogs and more.</span>
        </Link>
        <Link href="/docs/v2/styling/" class={styles.card}>
          <strong>Styling</strong>
          <span>Classes, CSS variables, unstyled and headless.</span>
        </Link>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Introduction — qwik-sonner",
  meta: [
    {
      name: "description",
      content: "Install qwik-sonner for Qwik 2 and render your first toast.",
    },
  ],
  frontmatter: {
    toc: [
      { id: "installation", title: "Installation" },
      { id: "quick-start", title: "Quick start" },
      { id: "entry-points", title: "Styled or headless" },
      { id: "differences", title: "Differences from sonner" },
      { id: "next", title: "Next steps" },
    ],
  },
};
