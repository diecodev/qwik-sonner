import { toast } from "qwik-sonner";
import { CodeBlock } from "./CodeBlock";
import { type Signal, component$ } from "@qwik.dev/core";
import { POSITIONS, type Position as PositionT } from "~/lib/toaster-context";

export const Position = component$(({ position }: { position: Signal<PositionT> }) => {
  return (
    <div>
      <h2>Position</h2>
      <p>Swipe direction changes depending on the position.</p>
      <div class="buttons">
        {POSITIONS.map((pos) => (
          <button
            data-active={position.value === pos}
            class="button"
            onClick$={() => {
              position.value = pos;
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
});
