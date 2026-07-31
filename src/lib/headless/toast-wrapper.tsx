import {
  $,
  component$,
  isBrowser,
  isSignal,
  Signal,
  useComputed$,
  useOn,
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
  Theme,
  ToastClassnames,
  ToasterProps,
  ToastT,
  ToastToDismiss,
  ToastProps,
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

  const subscribe = $(() => {
    // Seed with anything already active when this component becomes visible.
    activeToasts.value = ToastState.getActiveToasts() as ToastT[];

    return ToastState.subscribe((incoming) => {
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
  });

  useOn("qvisible", subscribe);

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

  const filteredToasts = useComputed$(() => {
    if (props.id) {
      return toasts.value.filter((t) => t.toasterId === props.id);
    }
    return toasts.value.filter((t) => !t.toasterId);
  });

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

  // Keep the top-layer popover state in sync with the toast count: show it the
  // moment a toast appears, hide it once the toaster empties. Runs only from
  // client event QRLs (`subscribe`/`removeToast`), never a task, so it fires in
  // consumer bundles too. No-ops when `topLayer` is off or the browser lacks
  // the Popover API (`showPopover` undefined) — older engines just ignore the
  // `popover` attribute and fall back to the normal `z-index` stacking.
  const syncTopLayer = $(() => {
    if (!topLayer) return;
    const el = sectionRef.value;
    if (!el || typeof el.showPopover !== "function") return;

    const hasToasts = toasts.value.length > 0;
    const isOpen = el.matches(":popover-open");
    if (hasToasts && !isOpen) {
      el.showPopover();
    } else if (!hasToasts && isOpen) {
      el.hidePopover();
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

  const onMountHandler = $(() => {
    return ToastState.subscribe((incoming) => {
      if ((incoming as ToastToDismiss).dismiss) {
        toasts.value = toasts.value.map((t) => (t.id === incoming.id ? { ...t, delete: true } : t));
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
      void syncTopLayer();
    });
  });

  // Resolve the system color scheme (and listen for changes) on the client.
  const onMountTheme = $(() => {
    const t = isSignal(props.theme) ? props.theme.value : props.theme;
    if (t !== "system") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    actualTheme.value = mql.matches ? "dark" : "light";
    mql.addEventListener("change", (event) => {
      actualTheme.value = (event as MediaQueryListEvent).matches ? "dark" : "light";
    });
  });

  // Keep `actualTheme` in sync with the `theme` prop (incl. SSR). Tracking the
  // unwrapped value subscribes to a `Signal` prop's `.value`, so changing the
  // signal at runtime re-runs this task on the resumed singleton.
  useTask$(({ track }) => {
    const t = track(() => (isSignal(props.theme) ? props.theme.value : props.theme)) as
      | Theme
      | undefined;
    if (t !== "system") {
      actualTheme.value = t === "dark" ? "dark" : "light";
      return;
    }
    if (!isBrowser) return;
    actualTheme.value = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
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

  // Wire the client-side toast subscription on `qinit` — the Qwik init event the
  // qwikloader fires once the container is ready. It is dispatched on
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
    $(async () => {
      await onMountHandler();
      await onMountTheme();
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
