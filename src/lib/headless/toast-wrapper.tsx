import {
  $,
  component$,
  QwikVisibleEvent,
  useComputed$,
  useOnDocument,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import {
  HeightT,
  Theme,
  ToasterProps,
  ToastT,
  ToastToDismiss,
  ToastProps,
} from "./types";
import {
  GAP,
  TOAST_WIDTH,
  VIEWPORT_OFFSET,
  VISIBLE_TOASTS_AMOUNT,
  SWIPE_THRESHOLD,
  TIME_BEFORE_UNMOUNT,
  TOAST_LIFETIME,
} from "./const";
import { ToastState } from "./state";
import { Toast } from "./toast";
import { toast } from "./state";

const Toaster = component$<ToasterProps>((props) => {
  const {
    invert = false,
    position = "bottom-right",
    hotkey = ["altKey", "KeyT"],
    expand,
    closeButton,
    class: localClass,
    offset,
    theme = "light",
    richColors,
    duration,
    style,
    visibleToasts = VISIBLE_TOASTS_AMOUNT,
    toastOptions,
    dir,
    gap = GAP,
    loadingIcon,
    icons,
    containerAriaLabel = "Notifications",
    pauseWhenPageIsHidden,
  } = props;

  const toasts = useSignal<ToastT[]>([]);
  const heights = useSignal<HeightT[]>([]);
  const expanded = useSignal(false);
  const interacting = useSignal(false);
  const listRef = useSignal<HTMLOListElement>();
  const lastFocusedElementRef = useSignal<HTMLElement | null>(null);
  const isFocusWithinRef = useSignal(false);

  const possiblePositions = useComputed$(() => {
    return Array.from(
      new Set(
        [position].concat(
          toasts.value
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

  const removeToast = $(
    (toast: ToastT) =>
      (toasts.value = toasts.value.filter(({ id }) => id !== toast.id))
  );

  const onMountHandler = $((_: QwikVisibleEvent, _1: HTMLElement) => {
    return ToastState.subscribe((toast) => {
      if ((toast as ToastToDismiss).dismiss) {
        toasts.value = toasts.value.map((t) =>
          t.id === toast.id ? { ...t, delete: true } : t
        );
        return;
      }

      const indexOfExistingToast = toasts.value.findIndex(
        (t) => t.id === toast.id
      );

      if (indexOfExistingToast !== -1) {
        return (toasts.value = [
          ...toasts.value.slice(0, indexOfExistingToast),
          { ...toasts.value[indexOfExistingToast], ...toast },
          ...toasts.value.slice(indexOfExistingToast + 1),
        ]);
      }

      return (toasts.value = [toast, ...toasts.value]);
    });
  });

  const onMountThemeHandler = $((_: QwikVisibleEvent, _1: HTMLElement) => {
    const selectedTheme = listRef.value?.getAttribute("data-theme") as Theme;

    if (selectedTheme !== "system") return;

    const themeFromLocalStorage = localStorage.getItem("theme") as Theme;

    if (themeFromLocalStorage) {
      return listRef.value?.setAttribute("data-theme", themeFromLocalStorage);
    }

    const themeFromMediaQuery =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    listRef.value?.setAttribute("data-theme", themeFromMediaQuery);
    localStorage.setItem("theme", themeFromMediaQuery);
  });

  const onMountDirHandler = $((_: QwikVisibleEvent, _1: HTMLElement) => {
    if (dir && dir !== "auto") return;

    const newDir = window.getComputedStyle(document.documentElement).direction;
    listRef.value?.setAttribute("dir", newDir);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "dir"
        ) {
          const value = (mutation.target as HTMLElement).getAttribute("dir");
          if (value === "auto" || !value) {
            return listRef.value!.setAttribute("dir", newDir);
          }
          listRef.value!.setAttribute("dir", value);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });
  });

  useTask$(({ track }) => {
    track(() => toasts.value);
    // Ensure expanded is always false when no toasts are present / only one left
    if (toasts.value.length <= 1) {
      expanded.value = false;
    }
  });

  useOnDocument(
    "keydown",
    $((ev) => {
      const isHotkeyPressed = hotkey.every(
        (key) => (ev as any)[key] || ev.code === key
      );

      if (isHotkeyPressed) {
        expanded.value = true;
        listRef.value?.focus();
      }

      if (
        ev.code === "Escape" &&
        (document.activeElement === listRef.value ||
          listRef.value?.contains(document.activeElement))
      ) {
        expanded.value = false;
      }
    })
  );

  useTask$(({ track, cleanup }) => {
    track(() => listRef.value);

    if (!listRef.value) return;

    cleanup(() => {
      if (lastFocusedElementRef.value) {
        lastFocusedElementRef.value.focus({ preventScroll: true });
        lastFocusedElementRef.value = null;
        isFocusWithinRef.value = false;
      }
    });
  });

  return (
    // Remove item from normal navigation flow, only available via hotkey
    <section
      aria-label={`${containerAriaLabel} ${hotkeyLabel}`}
      tabIndex={-1}
      onQVisible$={[onMountHandler, onMountThemeHandler, onMountDirHandler]}
    >
      {possiblePositions.value.map((position, index) => {
        const [y, x] = position.split("-");
        return (
          <ol
            key={position}
            dir={dir}
            tabIndex={-1}
            ref={listRef}
            class={localClass}
            data-sonner-toaster
            data-theme={theme}
            data-rich-colors={String(richColors)}
            data-y-position={y}
            data-x-position={x}
            style={{
              "--front-toast-height": `${heights.value[0]?.height ?? 0}px`,
              "--offset":
                typeof offset === "number"
                  ? `${offset}px`
                  : offset ?? VIEWPORT_OFFSET,
              "--width": `${TOAST_WIDTH}px`,
              "--gap": `${gap}px`,
              ...style,
            }}
            onBlur$={(event, target) => {
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
            onFocusIn$={(event, target) => {
              const isNotDismissible =
                target instanceof HTMLElement &&
                target.dataset.dismissible === "false";

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
            onPointerDown$={(_, target) => {
              const isNotDismissible =
                target instanceof HTMLElement &&
                target.dataset.dismissible === "false";

              if (isNotDismissible) return;
              interacting.value = true;
            }}
            onPointerUp$={() => (interacting.value = false)}
          >
            {toasts.value
              .filter(
                (toast) =>
                  (!toast.position && index === 0) ||
                  toast.position === position
              )
              .map((toast, index) => (
                <Toast
                  key={toast.id}
                  icons={icons}
                  index={index}
                  toast={toast}
                  duration={toastOptions?.duration ?? duration}
                  class={toastOptions?.class}
                  descriptionClass={toastOptions?.descriptionClass}
                  invert={invert}
                  visibleToasts={visibleToasts}
                  closeButton={
                    toastOptions?.closeButton ?? closeButton ?? false
                  }
                  interacting={interacting.value}
                  position={position}
                  style={toastOptions?.style}
                  unstyled={toastOptions?.unstyled}
                  classes={toastOptions?.classes}
                  cancelButtonStyle={toastOptions?.cancelButtonStyle}
                  actionButtonStyle={toastOptions?.actionButtonStyle}
                  removeToast={removeToast}
                  toasts={toasts.value.filter(
                    (t) => t.position === toast.position
                  )}
                  heights={heights}
                  expandByDefault={expand ?? false}
                  gap={gap}
                  loadingIcon={loadingIcon}
                  expanded={expanded}
                  pauseWhenPageIsHidden={pauseWhenPageIsHidden ?? false}
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
  Toast,
  GAP,
  TOAST_WIDTH,
  VIEWPORT_OFFSET,
  VISIBLE_TOASTS_AMOUNT,
  SWIPE_THRESHOLD,
  TIME_BEFORE_UNMOUNT,
  TOAST_LIFETIME,
};
