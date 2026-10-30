import { createContextId, useContext, type Signal } from "@qwik.dev/core";
import type { Position, Theme } from "qwik-sonner";

export type { Position, Theme };

export const POSITIONS: Position[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

/**
 * Live settings of the site-wide `<Toaster>` rendered in the root layout. Demos
 * on any page write to these signals instead of rendering their own Toaster,
 * so every toast on the site comes from the same one.
 */
export interface ToasterControls {
  position: Signal<Position>;
  theme: Signal<Theme>;
  richColors: Signal<boolean>;
  expand: Signal<boolean>;
  closeButton: Signal<boolean>;
  invert: Signal<boolean>;
}

export const ToasterControlsContext = createContextId<ToasterControls>("site.toaster-controls");

export const useToasterControls = () => useContext(ToasterControlsContext);

/** `id` of the secondary, top-layer Toaster used by the multi-toaster and dialog demos. */
export const SECONDARY_TOASTER = "secondary";
