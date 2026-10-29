import {
  $,
  component$,
  isBrowser,
  isSignal,
  Signal,
  useComputed$,
  useOnDocument,
  useSignal,
  useTask$,
} from "@qwik.dev/core";
import {
  Action,
  Direction,
  ExternalToast,
  HeightT,
  Offset,
  Position,
  PromiseData,
  SwipeDirection,
  Theme,
  ToastClassnames,
  ToastIcons,
  ToasterProps,
  ToastT,
  ToastToDismiss,
  ToastProps,
  ToastTypes,
} from "./types";
import {
  GAP,
  MOBILE_VIEWPORT_OFFSET,
  TOAST_WIDTH,
  VIEWPORT_OFFSET,
  VISIBLE_TOASTS_AMOUNT,
  SWIPE_THRESHOLD,
  TIME_BEFORE_UNMOUNT,
  TOAST_LIFETIME,
} from "./const";
import { ToastState, toast } from "./state";
import { Toast } from "./toast";

function getDocumentDirection(): Direction {
  if (typeof window === "undefined") return "ltr";
  if (typeof document === "undefined") return "ltr"; // For Fresh purpose

  const dirAttribute = document.documentElement.getAttribute("dir");

  if (dirAttribute === "auto" || !dirAttribute) {
    return window.getComputedStyle(document.documentElement).direction as Direction;
  }

  return dirAttribute as Direction;
}

// Resolve the `dir` prop (plain or `Signal`) to a concrete direction. Reads the
// signal's `.value` during render so the `<ol>` stays reactive on the resumed
// singleton, and re-reads the document direction each render so `"auto"` (and an
// omitted prop) keep tracking the live `<html dir>` (see the dir e2e tests).
function resolveDir(dir: Signal<Direction> | Direction | undefined): Direction {
  const d = isSignal(dir) ? dir.value : dir;
  return d == null || d === "auto" ? getDocumentDirection() : d;
}

// A Toaster without an `id` owns the toasts that have no `toasterId`; one with
// an `id` owns only the toasts addressed to it.
function isOwnToast(toast: ToastT, toasterId: string | undefined) {
  return toasterId ? toast.toasterId === toasterId : !toast.toasterId;
}

function assignOffset(defaultOffset?: Offset, mobileOffset?: Offset) {
  const styles: Record<string, string> = {};

  [defaultOffset, mobileOffset].forEach((offset, index) => {
    const isMobile = index === 1;
    const prefix = isMobile ? "--mobile-offset" : "--offset";
    const defaultValue = isMobile ? MOBILE_VIEWPORT_OFFSET : VIEWPORT_OFFSET;

    const assignAll = (value: string | number) => {
      ["top", "right", "bottom", "left"].forEach((key) => {
        styles[`${prefix}-${key}`] = typeof value === "number" ? `${value}px` : value;
      });
    };

    if (typeof offset === "number" || typeof offset === "string") {
      assignAll(offset);
    } else if (typeof offset === "object" && offset !== null) {
      ["top", "right", "bottom", "left"].forEach((key) => {
        const value = (offset as Record<string, string | number | undefined>)[key];
        if (value === undefined) {
          styles[`${prefix}-${key}`] = defaultValue;
        } else {
          styles[`${prefix}-${key}`] = typeof value === "number" ? `${value}px` : value;
        }
      });
    } else {
      assignAll(defaultValue);
    }
  });

  return styles;
}

/**
 * Reactive view of the currently active toasts — the Qwik equivalent of
 * sonner's `useSonner()`. Returns a `Signal` of the active toasts.
 */
export function useSonner() {
  const activeToasts = useSignal<ToastT[]>([]);
  // Same subscription scheme as the `Toaster` (see there): a task that is a
  // no-op on the server, re-run on the client by `qinit` when server-rendered.
  const resumed = useSignal(false);

  useTask$(({ track, cleanup }) => {
    track(() => resumed.value);
    if (!isBrowser) return;

    // Seed with anything already active when subscribing, newest first like
    // the subscriber below (and the Toaster).
    activeToasts.value = (ToastState.getActiveToasts() as ToastT[]).reverse();

    const unsubscribe = ToastState.subscribe((incoming) => {
      if ((incoming as ToastToDismiss).dismiss) {
        activeToasts.value = activeToasts.value.filter((t) => t.id !== incoming.id);
        return;
      }

      const indexOfExistingToast = activeToasts.value.findIndex((t) => t.id === incoming.id);

      if (indexOfExistingToast !== -1) {
        activeToasts.value = [
          ...activeToasts.value.slice(0, indexOfExistingToast),
          { ...activeToasts.value[indexOfExistingToast], ...incoming },
          ...activeToasts.value.slice(indexOfExistingToast + 1),
        ];
        return;
      }

      activeToasts.value = [incoming as ToastT, ...activeToasts.value];
    });

    cleanup(unsubscribe);
  });

  useOnDocument(
    "qinit",
    $(() => {
      resumed.value = true;
    }),
  );

  return { toasts: activeToasts };
}

const Toaster = component$<ToasterProps>((props) => {
  const {
    hotkey = ["altKey", "KeyT"],
    expand,
    class: localClass,
    offset,
    mobileOffset,
    duration,
    style,
    visibleToasts = VISIBLE_TOASTS_AMOUNT,
    toastOptions,
    gap = GAP,
    loadingIcon,
    icons,
    customAriaLabel,
    containerAriaLabel = "Notifications",
    topLayer = false,
  } = props;

  const toasts = useSignal<ToastT[]>([]);
  const sectionRef = useSignal<HTMLElement>();
  const heights = useSignal<HeightT[]>([]);
  const expanded = useSignal(false);
  const interacting = useSignal(false);
  // Initial theme for SSR; the task below keeps it in sync afterwards. Unwrap a
  // `Signal` prop; a plain value (or none) is used as-is.
  const initialTheme = isSignal(props.theme) ? props.theme.value : (props.theme ?? "light");
  const actualTheme = useSignal<"light" | "dark">(initialTheme === "dark" ? "dark" : "light");
  const listRef = useSignal<HTMLOListElement>();
  const lastFocusedElementRef = useSignal<HTMLElement | null>(null);
  const isFocusWithinRef = useSignal(false);

  // `toasts` also holds other Toasters' toasts (like sonner, so a partial update
  // without `toasterId` keeps the owner it was created with); render only ours.
  const filteredToasts = useComputed$(() => toasts.value.filter((t) => isOwnToast(t, props.id)));

  const possiblePositions = useComputed$(() => {
    // Resolve `position` reactively: a `Signal<Position>` is read via `.value`
    // (stays live on the resumed singleton), a plain value is used as-is.
    const basePosition = isSignal(props.position)
      ? props.position.value
      : (props.position ?? "bottom-right");
    return Array.from(
      new Set(
        [basePosition].concat(
          filteredToasts.value.filter((toast) => toast.position).map((toast) => toast.position!),
        ),
      ),
    );
  });

  const hotkeyLabel = hotkey.join("+").replace(/Key/g, "").replace(/Digit/g, "");

  // Keep the top-layer popover state in sync with this Toaster's own toasts:
  // show it the moment one appears, hide it once they are gone. Runs only from
  // client event QRLs (`subscribe`/`removeToast`), never a task, so it fires in
  // consumer bundles too. No-ops when `topLayer` is off or the browser lacks
  // the Popover API (`showPopover` undefined) — older engines just ignore the
  // `popover` attribute and fall back to the normal `z-index` stacking.
  //
  // `raise` (a new toast of ours arrived): the top layer stacks in opening
  // order, so a modal `<dialog>` (or fullscreen element, or popover) opened
  // after ours paints over it. Hiding and re-showing the popover moves it back
  // on top; it's done only while something else is in the top layer, and both
  // calls run in the same task, so the toasts are never rendered hidden (their
  // running animations carry on).
  const syncTopLayer = $((raise?: boolean) => {
    if (!topLayer) return;
    const el = sectionRef.value;
    if (!el || typeof el.showPopover !== "function") return;

    const hasToasts = filteredToasts.value.length > 0;
    const isOpen = el.matches(":popover-open");
    if (hasToasts && !isOpen) {
      el.showPopover();
    } else if (!hasToasts && isOpen) {
      el.hidePopover();
    } else if (hasToasts && raise) {
      const isCovered = Array.from(document.querySelectorAll(":modal, :popover-open")).some(
        (other) => other !== el && !el.contains(other),
      );
      if (isCovered) {
        el.hidePopover();
        el.showPopover();
      }
    }
  });

  const removeToast = $(async (toastToRemove: ToastT) => {
    const existing = toasts.value.find((t) => t.id === toastToRemove.id);
    if (existing && !existing.delete) {
      ToastState.dismiss(toastToRemove.id);
    }
    toasts.value = toasts.value.filter(({ id }) => id !== toastToRemove.id);
    await syncTopLayer();
  });

  // Flipped by `qinit` (see below) so the subscription and system-theme tasks
  // re-run on the client for a server-rendered Toaster.
  const resumed = useSignal(false);

  // Subscribe to the toast state on the client; `cleanup` unsubscribes on
  // unmount and before a re-run, so re-running never double-subscribes.
  //   - A Toaster first rendered on the client (behind a condition, or on a
  //     page reached with `<Link>`) subscribes as soon as this task runs. It
  //     can't wait for `qinit`: before Qwik 2.0.0-rc.4 the qwikloader fires it
  //     only once, at page load, so it never reaches client-rendered
  //     components (from rc.4 it does, and the resulting re-run is harmless).
  //   - A server-rendered Toaster ran this task on the server, where it is a
  //     no-op; `qinit` flips `resumed` so it runs again on the client.
  useTask$(({ track, cleanup }) => {
    track(() => resumed.value);
    if (!isBrowser) return;

    // Show the toasts that were published before this subscription existed —
    // fired before this Toaster mounted, by another `qinit` handler that ran
    // first, or by a click before this task re-ran after `qinit` (on Qwik >=
    // beta.45 `qinit` no longer runs in the qwikloader's serial queue, so that
    // click can even beat `qinit`). Newest first, like the subscriber below.
    const pending = (ToastState.getActiveToasts() as ToastT[]).filter(
      (t) => !toasts.value.some((existing) => existing.id === t.id),
    );
    if (pending.length) {
      toasts.value = [...pending.reverse(), ...toasts.value];
      void syncTopLayer(true);
    }

    const unsubscribe = ToastState.subscribe((incoming) => {
      if ((incoming as ToastToDismiss).dismiss) {
        // Our own toasts animate out (the `Toast` then calls `removeToast`).
        // Another Toaster's toasts are never rendered here, so nothing would
        // ever remove them: drop them now.
        toasts.value = toasts.value
          .filter((t) => t.id !== incoming.id || isOwnToast(t, props.id))
          .map((t) => (t.id === incoming.id ? { ...t, delete: true } : t));
        return;
      }

      const indexOfExistingToast = toasts.value.findIndex((t) => t.id === incoming.id);

      if (indexOfExistingToast !== -1) {
        toasts.value = [
          ...toasts.value.slice(0, indexOfExistingToast),
          { ...toasts.value[indexOfExistingToast], ...incoming },
          ...toasts.value.slice(indexOfExistingToast + 1),
        ];
        return;
      }

      toasts.value = [incoming as ToastT, ...toasts.value];
      if (isOwnToast(incoming as ToastT, props.id)) void syncTopLayer(true);
    });

    cleanup(unsubscribe);
  });

  // Keep `actualTheme` in sync with the `theme` prop (incl. SSR). Tracking the
  // unwrapped value subscribes to a `Signal` prop's `.value`, so changing the
  // signal at runtime re-runs this task on the resumed singleton.
  // With `"system"`, follow the OS color scheme on the client; `cleanup` drops
  // the listener as soon as the prop changes or the Toaster unmounts.
  useTask$(({ track, cleanup }) => {
    const t = track(() => (isSignal(props.theme) ? props.theme.value : props.theme)) as
      | Theme
      | undefined;
    if (t !== "system") {
      actualTheme.value = t === "dark" ? "dark" : "light";
      return;
    }
    // The OS scheme is only known on the client: a server-rendered Toaster
    // resolves it once `qinit` resumes it.
    track(() => resumed.value);
    if (!isBrowser) return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => {
      actualTheme.value = mql.matches ? "dark" : "light";
    };
    syncTheme();
    mql.addEventListener("change", syncTheme);
    cleanup(() => mql.removeEventListener("change", syncTheme));
  });

  useTask$(({ track }) => {
    const list = track(() => toasts.value);
    // Ensure expanded is always false when no toasts are present / only one left
    if (list.length <= 1) {
      expanded.value = false;
    }
  });

  useOnDocument(
    "keydown",
    $((ev) => {
      const event = ev as KeyboardEvent;
      const isHotkeyPressed =
        hotkey.length > 0 && hotkey.every((key) => (event as any)[key] || event.code === key);

      if (isHotkeyPressed) {
        expanded.value = true;
        listRef.value?.focus();
      }

      if (
        event.code === "Escape" &&
        (document.activeElement === listRef.value ||
          listRef.value?.contains(document.activeElement))
      ) {
        expanded.value = false;
      }
    }),
  );

  // Return focus to the previously-focused element once the toaster empties.
  // (Qwik doesn't reset refs on unmount, so React's "ol unmount" cleanup can't
  // be replicated via the ref — key off the toast count instead.)
  useTask$(({ track }) => {
    const count = track(() => toasts.value.length);
    if (count === 0 && isFocusWithinRef.value) {
      const last = lastFocusedElementRef.value;
      lastFocusedElementRef.value = null;
      isFocusWithinRef.value = false;
      if (last) last.focus({ preventScroll: true });
    }
  });

  // Resume a server-rendered Toaster on `qinit` — the Qwik init event the
  // qwikloader fires once the container is ready — which re-runs the
  // subscription and system-theme tasks on the client. It is dispatched on
  // `readystatechange` (and immediately on load), with a replay path for
  // late-registered listeners, so it fires regardless of page-load timing or
  // scroll position. We can't use the usual alternatives here:
  //   - `useVisibleTask$` / `qvisible` are IntersectionObserver-based, so they
  //     never run when the Toaster is rendered below the fold (its `<section>`
  //     is in normal flow) — the toaster would stay unsubscribed and the first
  //     toast publishes to zero subscribers (WebKit reproduced this reliably).
  //   - `DOMContentLoaded` is a one-shot event that has already fired by the
  //     time the qwikloader wires the listener in some engines (WebKit), so the
  //     handler never runs there either.
  useOnDocument(
    "qinit",
    $(() => {
      resumed.value = true;
    }),
  );

  return (
    // Remove item from normal navigation flow, only available via hotkey.
    // The popover (top-layer) lives on an inner wrapper, not the outer
    // `<section>`: a *closed* popover is `display:none` (UA style), which would
    // suppress any visibility-based wiring on it. The `<section>` stays in
    // normal flow.
    <section
      aria-label={customAriaLabel ?? `${containerAriaLabel} ${hotkeyLabel}`}
      tabIndex={-1}
      aria-live="polite"
      aria-relevant="additions text"
      aria-atomic="false"
      data-react-aria-top-layer
    >
      <div
        ref={sectionRef}
        data-sonner-toaster-popover={topLayer ? "" : undefined}
        popover={topLayer ? "manual" : undefined}
      >
        {possiblePositions.value.map((pos, index) => {
          const [y, x] = pos.split("-");

          if (!filteredToasts.value.length) return null;

          return (
            <ol
              key={pos}
              dir={resolveDir(props.dir)}
              tabIndex={-1}
              ref={listRef}
              class={localClass}
              data-sonner-toaster
              data-sonner-theme={actualTheme.value}
              data-y-position={y}
              data-x-position={x}
              style={{
                "--front-toast-height": `${heights.value[0]?.height ?? 0}px`,
                "--width": `${TOAST_WIDTH}px`,
                "--gap": `${gap}px`,
                ...style,
                ...assignOffset(offset, mobileOffset),
              }}
              onFocusOut$={(event, target) => {
                if (
                  isFocusWithinRef.value &&
                  !target.contains(event.relatedTarget as HTMLElement)
                ) {
                  isFocusWithinRef.value = false;
                  if (lastFocusedElementRef.value) {
                    lastFocusedElementRef.value.focus({
                      preventScroll: true,
                    });
                    lastFocusedElementRef.value = null;
                  }
                }
              }}
              onFocusIn$={(event) => {
                const focused = event.target;
                const isNotDismissible =
                  focused instanceof HTMLElement && focused.dataset.dismissible === "false";

                if (isNotDismissible) return;

                if (!isFocusWithinRef.value) {
                  isFocusWithinRef.value = true;
                  lastFocusedElementRef.value = event.relatedTarget as HTMLElement;
                }
              }}
              onMouseEnter$={() => (expanded.value = true)}
              onMouseMove$={() => (expanded.value = true)}
              onMouseLeave$={() => {
                // Avoid setting expanded to false when interacting with a toast, e.g. swiping
                if (!interacting.value) {
                  expanded.value = false;
                }
              }}
              onDragEnd$={() => (expanded.value = false)}
              onPointerDown$={(event) => {
                const target = event.target;
                const isNotDismissible =
                  target instanceof HTMLElement && target.dataset.dismissible === "false";

                if (isNotDismissible) return;
                interacting.value = true;
              }}
              onPointerUp$={() => (interacting.value = false)}
            >
              {filteredToasts.value
                .filter((t) => (!t.position && index === 0) || t.position === pos)
                .map((t, i) => (
                  <Toast
                    key={t.id}
                    icons={icons}
                    index={i}
                    toast={t}
                    defaultRichColors={props.richColors}
                    duration={toastOptions?.duration ?? duration}
                    class={toastOptions?.class}
                    descriptionClass={toastOptions?.descriptionClass}
                    invert={props.invert ?? false}
                    visibleToasts={visibleToasts}
                    closeButton={toastOptions?.closeButton ?? props.closeButton ?? false}
                    interacting={interacting.value}
                    position={pos}
                    style={toastOptions?.style}
                    unstyled={toastOptions?.unstyled}
                    classes={toastOptions?.classes}
                    cancelButtonStyle={toastOptions?.cancelButtonStyle}
                    actionButtonStyle={toastOptions?.actionButtonStyle}
                    closeButtonAriaLabel={toastOptions?.closeButtonAriaLabel}
                    removeToast={removeToast}
                    toasts={filteredToasts.value.filter((item) => item.position === t.position)}
                    heights={heights}
                    expandByDefault={expand ?? false}
                    gap={gap}
                    loadingIcon={loadingIcon}
                    expanded={expanded}
                    swipeDirections={props.swipeDirections}
                  />
                ))}
            </ol>
          );
        })}
      </div>
    </section>
  );
});

export {
  Toaster,
  toast,
  type ToasterProps,
  type ToastProps,
  type ToastT,
  type ExternalToast,
  type ToastClassnames,
  type ToastToDismiss,
  type Action,
  type Position,
  type Theme,
  type Direction,
  type SwipeDirection,
  type ToastIcons,
  type ToastTypes,
  type Offset,
  type PromiseData,
  Toast,
  GAP,
  TOAST_WIDTH,
  VIEWPORT_OFFSET,
  MOBILE_VIEWPORT_OFFSET,
  VISIBLE_TOASTS_AMOUNT,
  SWIPE_THRESHOLD,
  TIME_BEFORE_UNMOUNT,
  TOAST_LIFETIME,
};
