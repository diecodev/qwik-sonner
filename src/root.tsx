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
        <Toaster />
      </body>
    </>
  );
};
