import { component$ } from "@qwik.dev/core";
import { Link, type DocumentHead } from "@qwik.dev/router";
import { CodeBlock } from "~/components/CodeBlock";
import { Callout, H2, H3, InstallTabs } from "~/components/docs/ui";
import { VERSIONS } from "~/lib/versions";
import styles from "../pages.module.css";

const htmlBefore = `// v1 — string parsed as (sanitized) HTML
toast("<strong>Saved</strong> to drafts");`;

const htmlAfter = `// v2 — strings are text; use JSX for markup
toast(<span><strong>Saved</strong> to drafts</span>);`;

const iconsBefore = `// v1 — a component
<Toaster icons={{ success: CheckIcon }} />
toast("Done", { icon: CheckIcon });`;

const iconsAfter = `// v2 — JSX
<Toaster icons={{ success: <CheckIcon /> }} />
toast("Done", { icon: <CheckIcon /> });`;

const offsetCode = `// Keep v1's spacing
<Toaster offset="32px" />`;

const placementCode = `// v1 needed the Toaster before other content (issue #13).
// v2: anywhere in the root layout works.
export default component$(() => (
  <>
    <Slot />
    <Toaster />
  </>
));`;

export default component$(() => {
  const v2 = VERSIONS.v2;
  const v1 = VERSIONS.v1;

  return (
    <>
      <h1>Migrating from v1</h1>
      <p class="lead">
        qwik-sonner 2 follows your app to Qwik 2 and catches up with sonner 2. Most apps only change
        the install command; the breaking changes below are small and mechanical.
      </p>

      <div class={styles.compare}>
        <div class={styles.compareHead}>v1 ({v1.version})</div>
        <div class={styles.compareHead}>v2 ({v2.version})</div>
        <code>@builder.io/qwik 1.x</code>
        <code>@qwik.dev/core 2.x (peer dependency)</code>
        <code>ESM + CommonJS</code>
        <code>ESM only</code>
        <code>1 dependency (DOMPurify)</code>
        <code>0 dependencies</code>
        <code>sonner 1.x behaviour</code>
        <code>sonner 2.0.8 behaviour</code>
      </div>

      <H2 id="steps">Steps</H2>
      <H3 id="step-qwik">1. Move your app to Qwik 2</H3>
      <p>
        Follow Qwik's own upgrade guide first: packages move from <code>@builder.io/*</code> to{" "}
        <code>@qwik.dev/*</code>. qwik-sonner 2 doesn't run on Qwik 1.
      </p>
      <H3 id="step-install">2. Install v2</H3>
      <InstallTabs spec={v2.spec} />
      <p>
        Imports stay the same — <code>qwik-sonner</code> and <code>qwik-sonner/headless</code>.
      </p>
      <H3 id="step-breaking">3. Apply the breaking changes</H3>
      <p>Search your code for the patterns below.</p>

      <H2 id="breaking">Breaking changes</H2>

      <H3 id="html-strings">Strings render as text, not HTML</H3>
      <p>
        v1 parsed <code>title</code> and <code>description</code> strings as HTML through DOMPurify.
        v2 renders them as text, like sonner. Pass JSX for formatting:
      </p>
      <CodeBlock code={htmlBefore} />
      <CodeBlock code={htmlAfter} />

      <H3 id="icons">Icons are JSX</H3>
      <p>
        <code>icons</code>, a toast's <code>icon</code> and the deprecated <code>loadingIcon</code>{" "}
        take <code>JSXOutput</code> instead of a <code>Component</code>.
      </p>
      <CodeBlock code={iconsBefore} />
      <CodeBlock code={iconsAfter} />

      <H3 id="esm">ESM only</H3>
      <p>
        The <code>*.qwik.cjs</code> builds are gone. Qwik apps are ESM already, so this only matters
        for tooling that <code>require()</code>s the package.
      </p>

      <H3 id="defaults">New defaults</H3>
      <ul>
        <li>
          Viewport <code>offset</code>: 32px → <strong>24px</strong>, plus a new{" "}
          <code>mobileOffset</code> of 16px below 600px.
        </li>
        <li>
          Swipe distance to dismiss: 20px → <strong>45px</strong> (fast flicks still count).
        </li>
        <li>
          Markup and styles follow sonner 2's <code>data-sonner-*</code> contract. Custom CSS that
          targeted v1's markup may need new selectors — see{" "}
          <Link href="/docs/styling/#data-attributes">data attributes</Link>.
        </li>
        <li>
          <code>important: true</code> no longer makes a toast <code>aria-live="assertive"</code>.
          Every toast is announced through the toaster's polite live region, as in sonner 2.
        </li>
        <li>
          The toast list's theme attribute is <code>data-sonner-theme</code> (was{" "}
          <code>data-theme</code>), and <code>theme="system"</code> no longer reads or writes{" "}
          <code>localStorage.theme</code>.
        </li>
      </ul>
      <CodeBlock code={offsetCode} />

      <H2 id="deprecated">Deprecated</H2>
      <ul>
        <li>
          <code>pauseWhenPageIsHidden</code> — has no effect; timers always pause while the tab is
          hidden.
        </li>
        <li>
          <code>loadingIcon</code> — use <code>{"icons={{ loading: <Spinner /> }}"}</code>.
        </li>
      </ul>

      <H2 id="placement">Toaster placement</H2>
      <p>
        v1 recommended rendering the Toaster before the rest of the page to avoid rendering
        glitches. v2 subscribes when Qwik boots, so it can go anywhere in the root layout — but keep
        it in a server-rendered layout (see{" "}
        <Link href="/docs/advanced/#known-issues">known issues</Link>).
      </p>
      <CodeBlock code={placementCode} />

      <H2 id="new">Worth adopting</H2>
      <ul>
        <li>
          <Link href="/docs/toaster/#signals">Signals</Link> for <code>position</code>,{" "}
          <code>theme</code>, <code>richColors</code>, <code>dir</code> and <code>invert</code>.
        </li>
        <li>
          <Link href="/docs/advanced/#top-layer">
            <code>topLayer</code>
          </Link>{" "}
          for toasts above native dialogs.
        </li>
        <li>
          <Link href="/docs/advanced/#multiple-toasters">Multiple toasters</Link> with{" "}
          <code>id</code> / <code>toasterId</code>.
        </li>
        <li>
          <code>toast.promise(...).unwrap()</code>, <code>useSonner()</code>,{" "}
          <code>toast.getToasts()</code>.
        </li>
        <li>
          <code>swipeDirections</code>, per-toast <code>richColors</code>, <code>testId</code>.
        </li>
      </ul>
      <Callout type="tip">
        <p>
          The full list lives in the <Link href="/docs/changelog/">changelog</Link>.
        </p>
      </Callout>
    </>
  );
});

export const head: DocumentHead = {
  title: "Migrating from v1 — qwik-sonner",
  meta: [
    {
      name: "description",
      content: "Upgrade from qwik-sonner 1 (Qwik 1) to qwik-sonner 2 (Qwik 2).",
    },
  ],
  frontmatter: {
    toc: [
      { id: "steps", title: "Steps" },
      { id: "breaking", title: "Breaking changes" },
      { id: "html-strings", title: "Strings render as text", level: 3 },
      { id: "icons", title: "Icons are JSX", level: 3 },
      { id: "esm", title: "ESM only", level: 3 },
      { id: "defaults", title: "New defaults", level: 3 },
      { id: "deprecated", title: "Deprecated" },
      { id: "placement", title: "Toaster placement" },
      { id: "new", title: "Worth adopting" },
    ],
  },
};
