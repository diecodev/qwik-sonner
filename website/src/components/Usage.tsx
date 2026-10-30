import { component$ } from "@qwik.dev/core";
import { CodeBlock } from "./CodeBlock";

export const Usage = component$(() => {
  return (
    <div>
      <h2>Usage</h2>
      <p>Render the toaster in the root layout of your app.</p>
      <CodeBlock
        code={`import { component$, Slot } from "@qwik.dev/core";
import { Toaster, toast } from "qwik-sonner";

export default component$(() => {
  return (
    <>
      <Toaster />
      <button onClick$={() => toast("My first toast")}>
        Give me a toast
      </button>
      <Slot />
    </>
  );
});`}
      />
    </div>
  );
});
