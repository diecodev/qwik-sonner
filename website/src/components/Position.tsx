import { toast } from "qwik-sonner";
import { CodeBlock } from "./CodeBlock";
import { type Signal, component$ } from "@builder.io/qwik";

const positions = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const;

export type Position = (typeof positions)[number];

export const Position = component$(
  ({ position }: { position: Signal<any> }) => {
    return (
      <div>
        <h2>Position</h2>
        <p>Swipe direction changes depending on the position.</p>
        <div class="buttons">
          {positions.map((pos) => (
            <button
              data-active={position.value === pos}
              class="button"
              onClick$={() => {
                const toastsAmount = document.querySelectorAll(
                  "[data-sonner-toast]",
                ).length;
                position.value = pos;
                // No need to show a toast when there is already one
                if (toastsAmount > 0 && pos !== position.value) return;

                toast("Event has been created", {
                  description: "Monday, January 3rd at 6:00pm",
                });
              }}
              key={pos}
            >
              {pos}
            </button>
          ))}
        </div>
        <CodeBlock code={`<Toaster position="${position.value}" />`} />
      </div>
    );
  },
);
