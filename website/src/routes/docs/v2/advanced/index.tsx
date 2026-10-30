import { component$ } from "@qwik.dev/core";
import { Link, type DocumentHead } from "@qwik.dev/router";
import { CodeBlock } from "~/components/CodeBlock";
import { Callout, H2, H3 } from "~/components/docs/ui";
import styles from "../../pages.module.css";

const multiCode = `// Unnamed: renders every toast without a toasterId
<Toaster />

// Named: renders only toasts sent to it
<Toaster id="canvas" position="top-left" />

toast("Saved");                                  // → default Toaster
toast("Layer duplicated", { toasterId: "canvas" }); // → "canvas"`;

const topLayerCode = `<Toaster topLayer />`;

const useSonnerCode = `import { component$ } from "@qwik.dev/core";
import { useSonner } from "qwik-sonner";

export const ToastLog = component$(() => {
  const { toasts } = useSonner(); // Signal<Toast[]> of active toasts

  return (
    <ul>
      {toasts.value.map((t) => (
        <li key={t.id}>{typeof t.title === "string" ? t.title : "(custom)"}</li>
      ))}
    </ul>
  );
});`;

const clientOnlyCode = `import { component$, isBrowser, useTask$ } from "@qwik.dev/core";

useTask$(({ track }) => {
  const status = track(() => connection.value);
  if (!isBrowser) return; // never toast during SSR
  if (status === "offline") toast.warning("You're offline");
});`;

const typesCode = `import type {
  Toast,          // a toast as stored (ToastT)
  ExternalToast,  // options accepted by toast()
  ToasterProps,
  ToastClassnames,
  ToastToDismiss,
  Action,
} from "qwik-sonner";

// Not exported yet — derive them from ToasterProps:
type Position = Extract<ToasterProps["position"], string>;
type Theme = Extract<ToasterProps["theme"], string>;
type Direction = Extract<ToasterProps["dir"], string>;`;

export default component$(() => {
  return (
    <>
      <h1>Advanced</h1>
      <p class="lead">
        How the pieces fit together under Qwik's resumability — and the edges worth knowing.
      </p>

      <H2 id="how-it-works">How it works</H2>
      <p>
        <code>toast()</code> writes to a small module-level store, the same design as sonner. Each{" "}
        <code>{"<Toaster />"}</code> subscribes to it in the browser once Qwik starts (on the{" "}
        <code>qinit</code> event), so the Toaster's code only loads when the page boots — not when
        it scrolls into view — and toasts work even if it sits below the fold.
      </p>
      <p>
        Toasts only exist in the browser. Server-side rendering always outputs an empty toaster.
      </p>

      <H2 id="multiple-toasters">Multiple toasters</H2>
      <CodeBlock code={multiCode} />
      <p>
        Toasts without a <code>toasterId</code> go to the unnamed Toaster; a named Toaster ignores
        them.
      </p>

      <H2 id="top-layer">Top layer</H2>
      <p>
        <code>{"<dialog>.showModal()"}</code>, fullscreen elements and popovers render in the
        browser's top layer, which no <code>z-index</code> can beat. With <code>topLayer</code> the
        Toaster opens itself as a <code>popover="manual"</code> while it has toasts, so they stay
        visible above modals.
      </p>
      <CodeBlock code={topLayerCode} />
      <ul>
        <li>Off by default, for parity with sonner.</li>
        <li>No-op in browsers without the Popover API — it falls back to normal stacking.</li>
        <li>
          With the headless entry, add the{" "}
          <Link href="/docs/v2/styling/#headless-top-layer">popover reset</Link> yourself.
        </li>
      </ul>
      <p>
        See it next to a real dialog in the <Link href="/docs/v2/examples/#dialog">examples</Link>.
      </p>

      <H2 id="use-sonner">useSonner()</H2>
      <p>
        A reactive list of the active toasts, for building your own renderer, a badge, or a log. It
        subscribes when the component becomes visible.
      </p>
      <CodeBlock code={useSonnerCode} />
      <p>
        Outside components, read the store directly with <code>toast.getToasts()</code> and{" "}
        <code>toast.getHistory()</code>.
      </p>

      <H2 id="ssr">SSR and resumability</H2>
      <H3 id="client-only">Create toasts on the client</H3>
      <p>
        The store lives in module scope. On the server that scope is shared by every request, so a
        toast created during SSR would never reach the browser. Create toasts from event handlers,{" "}
        <code>useVisibleTask$</code>, or tasks guarded with <code>isBrowser</code>:
      </p>
      <CodeBlock code={clientOnlyCode} />
      <H3 id="placement">Where to render the Toaster</H3>
      <p>
        In the root layout (<code>src/routes/layout.tsx</code>), so it's part of the first
        server-rendered HTML and persists across client-side navigations.
      </p>

      <H2 id="accessibility">Accessibility</H2>
      <dl class={styles.dl}>
        <dt>Live region</dt>
        <dd>
          Toasts render in a <code>{'<section aria-live="polite">'}</code>, so screen readers
          announce them without stealing focus.
        </dd>
        <dt>Hotkey</dt>
        <dd>
          <kbd>Alt</kbd> + <kbd>T</kbd> (configurable with <code>hotkey</code>) moves focus to the
          toasts; focus returns where it was when they're gone.
        </dd>
        <dt>Labels</dt>
        <dd>
          <code>containerAriaLabel</code>, <code>customAriaLabel</code> and{" "}
          <code>toastOptions.closeButtonAriaLabel</code>.
        </dd>
        <dt>Timers</dt>
        <dd>Pause on hover, while pressing a toast, and while the tab is hidden.</dd>
        <dt>Motion</dt>
        <dd>
          Transitions and animations are off under <code>prefers-reduced-motion</code>.
        </dd>
      </dl>

      <H2 id="types">TypeScript</H2>
      <CodeBlock code={typesCode} />

      <H2 id="known-issues">Known issues</H2>
      <p>
        Found in 2.0.0-beta.1. Each has a workaround; follow the{" "}
        <Link href="/docs/changelog/">changelog</Link> for fixes.
      </p>
      <Callout type="warning" title="A Toaster first rendered on the client shows no toasts">
        <p>
          The subscription relies on <code>qinit</code>, which fires once when the page boots. A
          Toaster that mounts later — behind a condition, or on a page reached through{" "}
          <code>{"<Link>"}</code> — misses it. Render the Toaster in the root layout.
        </p>
      </Callout>
      <Callout type="warning" title="useSonner() in a component first rendered on the client">
        <p>
          Same cause: <code>useSonner()</code> subscribes on <code>qvisible</code>, which a
          component mounted after boot (e.g. on a page reached through <code>{"<Link>"}</code>)
          doesn't receive, so its list stays empty until a full page load.
        </p>
      </Callout>
      <Callout type="warning" title="topLayer and modals opened while toasts are showing">
        <p>
          The browser stacks top-layer elements in the order they open, so a Toaster whose popover
          is already open when a <code>{"<dialog>"}</code> opens stays beneath it and toasts fired
          from the dialog are hidden. In 2.0.0-beta.1 a <code>topLayer</code> Toaster also opens its
          popover for toasts meant for other Toasters and, since it never renders them, never closes
          it again. Use <code>topLayer</code> only with a single Toaster, and open modals while no
          toasts are showing.
        </p>
      </Callout>
      <Callout type="note" title={'Switching away from theme="system"'}>
        <p>
          A Toaster that started with <code>theme="system"</code> keeps listening to OS changes
          after its theme signal moves to <code>light</code>/<code>dark</code> (inherited from
          sonner). If you switch themes at runtime, start from an explicit theme.
        </p>
      </Callout>
      <Callout type="note" title="Some type unions aren't exported">
        <p>
          <code>Position</code>, <code>Theme</code> and <code>Direction</code> must be derived from{" "}
          <code>ToasterProps</code> for now — see <a href="#types">TypeScript</a>.
        </p>
      </Callout>
    </>
  );
});

export const head: DocumentHead = {
  title: "Advanced — qwik-sonner",
  meta: [
    {
      name: "description",
      content:
        "Multiple toasters, the top layer, useSonner, SSR and resumability, accessibility and known issues.",
    },
  ],
  frontmatter: {
    toc: [
      { id: "how-it-works", title: "How it works" },
      { id: "multiple-toasters", title: "Multiple toasters" },
      { id: "top-layer", title: "Top layer" },
      { id: "use-sonner", title: "useSonner()" },
      { id: "ssr", title: "SSR and resumability" },
      { id: "client-only", title: "Create toasts on the client", level: 3 },
      { id: "placement", title: "Where to render the Toaster", level: 3 },
      { id: "accessibility", title: "Accessibility" },
      { id: "types", title: "TypeScript" },
      { id: "known-issues", title: "Known issues" },
    ],
  },
};
