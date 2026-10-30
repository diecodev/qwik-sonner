import { component$, Slot, useContextProvider, useSignal } from "@qwik.dev/core";
import type { RequestHandler } from "@qwik.dev/router";
import { Toaster } from "qwik-sonner";
import {
  SECONDARY_TOASTER,
  ToasterControlsContext,
  type Position,
  type Theme,
  type ToasterControls,
} from "~/lib/toaster-context";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  });
};

export default component$(() => {
  const controls: ToasterControls = {
    position: useSignal<Position>("bottom-right"),
    theme: useSignal<Theme>("light"),
    richColors: useSignal(false),
    expand: useSignal(false),
    closeButton: useSignal(false),
    invert: useSignal(false),
  };
  useContextProvider(ToasterControlsContext, controls);

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
