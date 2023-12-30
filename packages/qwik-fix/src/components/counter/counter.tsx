import { $, component$, noSerialize, useSignal } from "@builder.io/qwik";
import { toast } from "../../utils/state";

export const Counter = component$(() => {
  const count = useSignal(0);

  return (
    <div>
      <p>Count: {count.value}</p>
      {count.value === 0 && (
        <button onClick$={() => count.value++}>aumentar</button>
      )}
      <p>
        <button
          onClick$={() => {
            toast("Event has been created");
          }}
        >
          default
        </button>
        <button
          onClick$={() => {
            toast.message("Event has been created", {
              description: "Monday, January 3rd at 6:00pm",
            });
          }}
        >
          message
        </button>
        <button
          onClick$={() => {
            toast.success("Event has been created");
          }}
        >
          success
        </button>
        <button
          onClick$={() => {
            toast.info("Be at the area 10 minutes before the event time");
          }}
        >
          info
        </button>
        <button
          onClick$={() => {
            toast.warning("Event start time cannot be earlier than 8am");
          }}
        >
          warning
        </button>
        <button
          onClick$={() => {
            toast.error("Event has not been created");
          }}
        >
          error
        </button>
        <button
          onClick$={() => {
            toast("Event has been created", {
              action: {
                label: "Undo",
                onClick: noSerialize(() => console.log("Undo")),
              },
            });
          }}
        >
          action
        </button>
        <button
          onClick$={() => {
            const promise = $((): Promise<{ name: string }> =>
              new Promise((resolve) =>
                setTimeout(() => resolve({ name: "Moick" }), 2000)
              ));

            toast.promise<{name: string}>(promise, {
              loading: "Loading...",
              success: $((data: { name: string }) => {
                return `${data.name} toast has been added`;
              }),
              error: "Error",
            });
          }}
        >
          promise
        </button>
        <button
          onClick$={() => {
            toast.custom((t) => (
              <div>
                <h1>Custom toast</h1>
                 <button onClick$={() => toast.dismiss(t)}>Dismiss</button>
              </div>
            ));
          }}
        >
          custom
        </button>
      </p>
    </div>
  );
});
