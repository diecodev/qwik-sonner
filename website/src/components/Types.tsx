import { $, component$, useSignal } from "@builder.io/qwik";
import { toast } from "qwik-sonner";
import { CodeBlock } from "./CodeBlock";

const promiseCode = "`${data.name} toast has been added`";

export const Types = component$(() => {
  const activeType = useSignal(allTypes[0]);

  return (
    <div>
      <h2>Types</h2>
      <p>
        You can customize the type of toast you want to render, and pass an
        options object as the second argument.
      </p>
      <div class="buttons">
        {allTypes.map((type) => (
          <button
            class="button"
            data-active={activeType.value.name === type.name}
            onClick$={() => {
              type.action();
              activeType.value = type;
            }}
            key={type.name}
          >
            {type.name}
          </button>
        ))}
      </div>
      <CodeBlock code={activeType.value.snippet}></CodeBlock>
    </div>
  );
});

const allTypes = [
  {
    name: "Default",
    snippet: `toast('Event has been created')`,
    action: $(() => toast("Event has been created")),
  },
  {
    name: "Description",
    snippet: `toast.message('Event has been created', {
  description: 'Monday, January 3rd at 6:00pm',
})`,
    action: $(() =>
      toast("Event has been created", {
        description: "Monday, January 3rd at 6:00pm",
      }),
    ),
  },
  {
    name: "Success",
    snippet: `toast.success('Event has been created')`,
    action: $(() => toast.success("Event has been created")),
  },
  {
    name: "Info",
    snippet: `toast.info('Be at the area 10 minutes before the event time')`,
    action: $(() =>
      toast.info("Be at the area 10 minutes before the event time"),
    ),
  },
  {
    name: "Warning",
    snippet: `toast.warning('Event start time cannot be earlier than 8am')`,
    action: $(() =>
      toast.warning("Event start time cannot be earlier than 8am"),
    ),
  },
  {
    name: "Error",
    snippet: `toast.error('Event has not been created')`,
    action: $(() => toast.error("Event has not been created")),
  },
  {
    name: "Action",
    snippet: `toast('Event has been created', {
  action: {
    label: 'Undo',
    onClick: $(() => console.log('Undo'))
  },
})`,
    action: $(() =>
      toast.message("Event has been created", {
        action: {
          label: "Undo",
          onClick$: $(() => console.log("Undo")),
        },
      }),
    ),
  },
  {
    name: "Promise",
    snippet: `const promise = $(() => new Promise((resolve) => setTimeout(() => resolve({ name: 'Sonner' }), 2000)));

toast.promise(promise, {
  loading: 'Loading...',
  success: $((data) => {
    return ${promiseCode};
  }),
  error: 'Error',
});`,
    action: $(() =>
      toast.promise(
        $(
          (): Promise<{ name: string }> =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve({ name: "Sonner" });
              }, 2000);
            }),
        ),
        {
          loading: "Loading...",
          success: $((data) => {
            return `${data.name} toast has been added`;
          }),
          error: "Error",
        },
      ),
    ),
  },
  {
    name: "Custom",
    snippet: `toast(<div>A custom toast with default styling</div>, {
  duration: Number.POSITIVE_INFINITY,
})`,
    action: $(() =>
      toast(<div>A custom toast with default styling</div>, {
        duration: Number.POSITIVE_INFINITY,
      }),
    ),
  },
];
