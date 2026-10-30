import { createContextId, useContext, type Signal } from "@qwik.dev/core";
import type { ToasterProps } from "qwik-sonner";

// qwik-sonner doesn't export these unions yet, so derive them from the props.
export type Position = Extract<NonNullable<ToasterProps["position"]>, string>;
export type Theme = Extract<NonNullable<ToasterProps["theme"]>, string>;

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
 * on any page write to these signals instead of rendering their own Toaster:
 * a Toaster that is first rendered on the client (e.g. after a `<Link>`
 * navigation) never subscribes in qwik-sonner 2.0.0-beta.1.
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
