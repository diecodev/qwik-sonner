import { component$ } from "@builder.io/qwik";
import { CodeBlock } from "./CodeBlock";

export const Usage = component$(() => {
  return (
    <div>
      <h2>Usage</h2>
      <p>Render the toaster in the root of your app.</p>
      <CodeBlock
        code={`import { Toaster, toast } from 'sonner'
// ...
const App = component$(() => {
  return (
    <div>
      <Toaster />
      <button onClick$={() => toast('My first toast')}>
        Give me a toast
      </button>
    </div>
  )
})`}
      />
    </div>
  );
});
