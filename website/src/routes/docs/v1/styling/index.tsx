import { component$ } from "@qwik.dev/core";
import { type DocumentHead } from "@qwik.dev/router";
import { CodeBlock } from "~/components/CodeBlock";
import { H2 } from "~/components/docs/ui";

const globalCode = `<Toaster
  toastOptions={{
    style: { background: "red" },
    class: "my-toast",
    descriptionClass: "my-toast-description",
  }}
/>`;

const singleCode = `toast("Event has been created", {
  style: { background: "red" },
  class: "my-toast",
  descriptionClass: "my-toast-description",
});`;

const classesCode = `<Toaster
  toastOptions={{
    unstyled: true,
    classes: {
      toast: "bg-blue-400",
      title: "text-red-400",
      description: "text-red-400",
      actionButton: "bg-zinc-400",
      cancelButton: "bg-orange-400",
      closeButton: "bg-lime-400",
    },
  }}
/>`;

const optionsCode = `<Toaster theme="dark" />
<Toaster position="top-center" />
<Toaster expand visibleToasts={9} />
<Toaster richColors closeButton />
<Toaster offset="80px" />
<Toaster duration={10000} />
<Toaster hotkey={["KeyC"]} />`;

export default component$(() => {
  return (
    <>
      <h1>Styling</h1>
      <p class="lead">Customizing toasts in qwik-sonner 1.x.</p>

      <H2 id="all-toasts">All toasts</H2>
      <CodeBlock code={globalCode} />

      <H2 id="single-toast">A single toast</H2>
      <CodeBlock code={singleCode} />

      <H2 id="classes">Per-part classes</H2>
      <p>
        <code>classes</code> accepts <code>toast</code>, <code>title</code>,{" "}
        <code>description</code>, <code>loader</code>, <code>closeButton</code>,{" "}
        <code>cancelButton</code>, <code>actionButton</code>, <code>content</code>,{" "}
        <code>icon</code> and one key per type (<code>success</code>, <code>error</code>,{" "}
        <code>info</code>, <code>warning</code>, <code>loading</code>, <code>default</code>).
        Combine it with <code>unstyled</code> to start from a blank slate.
      </p>
      <CodeBlock code={classesCode} />

      <H2 id="toaster-options">Toaster options</H2>
      <CodeBlock code={optionsCode} />

      <H2 id="headless">Headless</H2>
      <p>
        Import from <code>qwik-sonner/headless</code> for the same components without the
        stylesheet, and use <code>toast.custom</code> to render your own markup.
      </p>
    </>
  );
});

export const head: DocumentHead = {
  title: "Styling (v1) — qwik-sonner",
  meta: [{ name: "description", content: "Styling qwik-sonner 1.x toasts." }],
  frontmatter: {
    toc: [
      { id: "all-toasts", title: "All toasts" },
      { id: "single-toast", title: "A single toast" },
      { id: "classes", title: "Per-part classes" },
      { id: "toaster-options", title: "Toaster options" },
      { id: "headless", title: "Headless" },
    ],
  },
};
