import {
  component$,
  Slot,
  sync$,
  useContextProvider,
  useOnDocument,
  useSignal,
} from "@qwik.dev/core";
import { Toaster } from "qwik-sonner";
import {
  SECONDARY_TOASTER,
  ToasterControlsContext,
  type Position,
  type Theme,
  type ToasterControls,
} from "~/lib/toaster-context";

/**
 * The site-wide Toasters and the context that drives them. The root layout
 * wraps every page in it; routes/404.tsx wraps itself too, because Qwik Router
 * renders a not-found page without any layout.
 */
export const SiteShell = component$(() => {
  const controls: ToasterControls = {
    position: useSignal<Position>("bottom-right"),
    theme: useSignal<Theme>("light"),
    richColors: useSignal(false),
    expand: useSignal(false),
    closeButton: useSignal(false),
    invert: useSignal(false),
  };
  useContextProvider(ToasterControlsContext, controls);

  // Links to a section of the same page (the table of contents, heading
  // anchors, `/page/#section`) scroll smoothly. Only those: the router also
  // scrolls on page changes (to the top, or back), and a global
  // `scroll-behavior: smooth` would animate those too. `sync$`, so the style is
  // set before the browser or the router scrolls; it's removed once the scroll
  // ends (or after a while, where `scrollend` isn't supported).
  useOnDocument(
    "click",
    sync$((event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const link = (event.target as Element | null)?.closest?.("a[href*='#']");
      if (
        !(link instanceof HTMLAnchorElement) ||
        !link.hash ||
        link.origin !== location.origin ||
        link.pathname !== location.pathname ||
        matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }
      const root = document.documentElement;
      root.style.scrollBehavior = "smooth";
      const reset = () => root.style.removeProperty("scroll-behavior");
      addEventListener("scrollend", reset, { once: true });
      setTimeout(reset, 1500);
    }),
  );

  return (
    <>
      {/*
       * One Toaster for the whole site, rendered from the root layout so it is
       * server-rendered on first load and survives client-side navigation.
       */}
      <Toaster
        position={controls.position}
        theme={controls.theme}
        richColors={controls.richColors}
        invert={controls.invert}
        expand={controls.expand.value}
        closeButton={controls.closeButton.value}
      />
      <Toaster id={SECONDARY_TOASTER} position="top-center" theme={controls.theme} topLayer />
      <Slot />
    </>
  );
});
