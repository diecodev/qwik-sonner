import { toast } from "qwik-sonner";
import { CodeBlock } from "./CodeBlock";
import { type Signal } from "@builder.io/qwik";

export const ExpandModes = ({ expand }: { expand: Signal<boolean> }) => {
  return (
    <div>
      <h2>Expand</h2>
      <p>
        You can change the amount of toasts visible through the{" "}
        <code>visibleToasts</code> prop.
      </p>
      <div class="buttons">
        <button
          data-active={expand}
          class="button"
          onClick$={() => {
            toast("Event has been created", {
              description: "Monday, January 3rd at 6:00pm",
            });
            expand.value = true;
          }}
        >
          Expand
        </button>
        <button
          data-active={!expand}
          class="button"
          onClick$={() => {
            toast("Event has been created", {
              description: "Monday, January 3rd at 6:00pm",
            });
            expand.value = false;
          }}
        >
          Default
        </button>
      </div>
      <CodeBlock code={`<Toaster expand={${expand.value}} />`} />
    </div>
  );
};
