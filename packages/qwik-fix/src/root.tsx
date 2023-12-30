import { Toaster } from "./components";
import { Counter } from "./components/counter/counter";

export default () => {
  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <title>Qwik Blank App</title>
      </head>
      <body>
        <Toaster />
        <Counter />
      </body>
    </>
  );
};
