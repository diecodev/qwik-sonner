import {
  $,
  component$,
  isBrowser,
  QwikVisibleEvent,
  useComputed$,
  useOn,
  useOnDocument,
  useSignal,
  useTask$,
} from "@qwik.dev/core";
import {
  Action,
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

function getDocumentDirection(): NonNullable<ToasterProps["dir"]> {
  if (typeof window === "undefined") return "ltr";
  if (typeof document === "undefined") return "ltr"; // For Fresh purpose

  const dirAttribute = document.documentElement.getAttribute("dir");

  if (dirAttribute === "auto" || !dirAttribute) {
    return window.getComputedStyle(document.documentElement)
      .direction as NonNullable<ToasterProps["dir"]>;
  }

  return dirAttribute as NonNullable<ToasterProps["dir"]>;
}

function assignOffset(defaultOffset?: Offset, mobileOffset?: Offset) {
  const styles: Record<string, string> = {};

  [defaultOffset, mobileOffset].forEach((offset, index) => {
    const isMobile = index === 1;
    const prefix = isMobile ? "--mobile-offset" : "--offset";
    const defaultValue = isMobile ? MOBILE_VIEWPORT_OFFSET : VIEWPORT_OFFSET;

    const assignAll = (value: string | number) => {
      ["top", "right", "bottom", "left"].forEach((key) => {
        styles[`${prefix}-${key}`] =
          typeof value === "number" ? `${value}px` : value;
      });
    };

    if (typeof offset === "number" || typeof offset === "string") {
      assignAll(offset);
    } else if (typeof offset === "object" && offset !== null) {
      ["top", "right", "bottom", "left"].forEach((key) => {
        const value = (offset as Record<string, string | number | undefined>)[
          key
        ];
        if (value === undefined) {
          styles[`${prefix}-${key}`] = defaultValue;
        } else {
          styles[`${prefix}-${key}`] =
            typeof value === "number" ? `${value}px` : value;
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
        activeToasts.value = activeToasts.value.filter(
          (t) => t.id !== incoming.id
        );
        return;
      }

      const indexOfExistingToast = activeToasts.value.findIndex(
        (t) => t.id === incoming.id
      );

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
    position = "bottom-right",
    hotkey = ["altKey", "KeyT"],
    expand,
    class: localClass,
    offset,
    mobileOffset,
    theme = "light",
    duration,
    style,
    visibleToasts = VISIBLE_TOASTS_AMOUNT,
    toastOptions,
    dir = getDocumentDirection(),
    gap = GAP,
    loadingIcon,
    icons,
    customAriaLabel,
    containerAriaLabel = "Notifications",
  } = props;

  const toasts = useSignal<ToastT[]>([]);
  const heights = useSignal<HeightT[]>([]);
  const expanded = useSignal(false);
  const interacting = useSignal(false);
  const actualTheme = useSignal<"light" | "dark">(
    theme !== "system" ? theme : "light"
  );
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
    return Array.from(
      new Set(
        [position].concat(
          filteredToasts.value
            .filter((toast) => toast.position)
            .map((toast) => toast.position!)
        )
      )
    );
  });

  const hotkeyLabel = hotkey
    .join("+")
    .replace(/Key/g, "")
    .replace(/Digit/g, "");

  const removeToast = $((toastToRemove: ToastT) => {
    const existing = toasts.value.find((t) => t.id === toastToRemove.id);
    if (existing && !existing.delete) {
      ToastState.dismiss(toastToRemove.id);
    }
    toasts.value = toasts.value.filter(({ id }) => id !== toastToRemove.id);
  });

  const onMountHandler = $((_: QwikVisibleEvent, _1: HTMLElement) => {
    return ToastState.subscribe((incoming) => {
      if ((incoming as ToastToDismiss).dismiss) {
        toasts.value = toasts.value.map((t) =>
          t.id === incoming.id ? { ...t, delete: true } : t
        );
        return;
      }

      const indexOfExistingToast = toasts.value.findIndex(
        (t) => t.id === incoming.id
      );

      if (indexOfExistingToast !== -1) {
        toasts.value = [
          ...toasts.value.slice(0, indexOfExistingToast),
          { ...toasts.value[indexOfExistingToast], ...incoming },
          ...toasts.value.slice(indexOfExistingToast + 1),
        ];
        return;
      }

      toasts.value = [incoming as ToastT, ...toasts.value];
    });
  });

  // Resolve the system color scheme (and listen for changes) on the client.
  const onMountTheme = $((_: QwikVisibleEvent, _1: HTMLElement) => {
    if (props.theme !== "system") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    actualTheme.value = mql.matches ? "dark" : "light";
    mql.addEventListener("change", (event) => {
      actualTheme.value = (event as MediaQueryListEvent).matches
        ? "dark"
        : "light";
    });
  });

  // Keep `actualTheme` in sync with an explicit `theme` prop (incl. SSR).
  useTask$(({ track }) => {
    const t = track(() => props.theme) as Theme | undefined;
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
        hotkey.length > 0 &&
        hotkey.every((key) => (event as any)[key] || event.code === key);

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
    })
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

  return (
    // Remove item from normal navigation flow, only available via hotkey
    <section
      aria-label={customAriaLabel ?? `${containerAriaLabel} ${hotkeyLabel}`}
      tabIndex={-1}
      aria-live="polite"
      aria-relevant="additions text"
      aria-atomic="false"
      data-react-aria-top-layer
      onQVisible$={[onMountHandler, onMountTheme]}
    >
      {possiblePositions.value.map((pos, index) => {
        const [y, x] = pos.split("-");

        if (!filteredToasts.value.length) return null;

        return (
          <ol
            key={pos}
            dir={dir === "auto" ? getDocumentDirection() : dir}
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
                focused instanceof HTMLElement &&
                focused.dataset.dismissible === "false";

              if (isNotDismissible) return;

              if (!isFocusWithinRef.value) {
                isFocusWithinRef.value = true;
                lastFocusedElementRef.value =
                  event.relatedTarget as HTMLElement;
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
                target instanceof HTMLElement &&
                target.dataset.dismissible === "false";

              if (isNotDismissible) return;
              interacting.value = true;
            }}
            onPointerUp$={() => (interacting.value = false)}
          >
            {filteredToasts.value
              .filter(
                (t) => (!t.position && index === 0) || t.position === pos
              )
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
                  closeButton={
                    toastOptions?.closeButton ?? props.closeButton ?? false
                  }
                  interacting={interacting.value}
                  position={pos}
                  style={toastOptions?.style}
                  unstyled={toastOptions?.unstyled}
                  classes={toastOptions?.classes}
                  cancelButtonStyle={toastOptions?.cancelButtonStyle}
                  actionButtonStyle={toastOptions?.actionButtonStyle}
                  closeButtonAriaLabel={toastOptions?.closeButtonAriaLabel}
                  removeToast={removeToast}
                  toasts={filteredToasts.value.filter(
                    (item) => item.position === t.position
                  )}
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
