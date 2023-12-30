import { $, component$ } from "@builder.io/qwik";
import { toast } from "../../utils/state";

export const Counter = component$(() => {
  const fn = $(() => console.log("Hi"));

  return (
    <div>
      <button
        onClick$={() => {
          toast("Event has been created", {
            action: {
              label: "Undo",
              onClick: fn,
            },
          });
        }}
      >
        action
      </button>
    </div>
  );
});
