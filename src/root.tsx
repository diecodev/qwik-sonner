import { $ } from "@builder.io/qwik";
import { Toaster, toast } from "./components";

export default () => {
  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <title>Qwik Blank App</title>
      </head>
      <body>
        <button onClick$={() => toast.info("I'm a toast. Look at me")}>
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
        <Toaster />
      </body>
    </>
  );
};
