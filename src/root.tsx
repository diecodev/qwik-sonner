import { $, component$, useSignal } from "@builder.io/qwik";
import { Toaster, toast } from "./lib";

export default component$(() => {
  const tId = useSignal<number | string>("myCustomId");

  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <title>Qwik Blank App</title>
      </head>
      <body>
        <button
          onClick$={() =>
            toast.success("I'm a toast. Look at me", { id: tId.value })
          }
        >
          open toaster
        </button>
        <button onClick$={() => toast(<div>My custom toast</div>)}>
          open toaster 2
        </button>
        <button
          onClick$={() =>
            toast("Event has been created", {
              onDismiss: $((t) =>
                console.log(`Toast with id ${t.id} has been dismissed`)
              ),
              onAutoClose: $((t) =>
                console.log(
                  `Toast with id ${t.id} has been closed automatically`
                )
              ),
            })
          }
        >
          open toaster 3
        </button>
        <button
          onClick$={() =>
            toast.custom((t) => (
              <div>
                <p>Event Created</p>
                <p>Today at 4:00pm - &quot;Louvre Museum&quot;</p>
                <button onClick$={() => toast.dismiss(t)}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M2.96967 2.96967C3.26256 2.67678 3.73744 2.67678 4.03033 2.96967L8 6.939L11.9697 2.96967C12.2626 2.67678 12.7374 2.67678 13.0303 2.96967C13.3232 3.26256 13.3232 3.73744 13.0303 4.03033L9.061 8L13.0303 11.9697C13.2966 12.2359 13.3208 12.6526 13.1029 12.9462L13.0303 13.0303C12.7374 13.3232 12.2626 13.3232 11.9697 13.0303L8 9.061L4.03033 13.0303C3.73744 13.3232 3.26256 13.3232 2.96967 13.0303C2.67678 12.7374 2.67678 12.2626 2.96967 11.9697L6.939 8L2.96967 4.03033C2.7034 3.76406 2.6792 3.3474 2.89705 3.05379L2.96967 2.96967Z"></path>
                  </svg>
                </button>
              </div>
            ))
          }
        >
          open toaster 3
        </button>
        <Toaster richColors duration={10000} theme="system" />
      </body>
    </>
  );
});
