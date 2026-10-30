import { component$ } from "@qwik.dev/core";
import { QwikRouterProvider, RouterOutlet, ServiceWorkerRegister } from "@qwik.dev/router";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";

// Applies a theme the visitor picked earlier before first paint, so a dark
// preference doesn't flash light. Without one, CSS follows the system setting.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikRouterProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  return (
    <QwikRouterProvider>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <script dangerouslySetInnerHTML={themeScript} />
        <RouterHead />
        <ServiceWorkerRegister />
      </head>
      <body lang="en">
        <RouterOutlet />
      </body>
    </QwikRouterProvider>
  );
});
