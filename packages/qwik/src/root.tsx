import { Toaster, toast } from "./components";

export default () => {
  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <title>Qwik Blank App</title>
      </head>
      <body
        style={{
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;",
          minHeight: "100vh",
        }}
      >
        <button onClick$={() => toast.success("Prueba")}>Add toast</button>
        <Toaster richColors />
      </body>
    </>
  );
};
