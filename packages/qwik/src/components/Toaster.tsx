import {
  $,
  component$,
  useOnDocument,
  useSignal,
  useStore,
  useStyles$,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  GAP,
  MAX_VISIBLE_TOASTS,
  TOAST_WIDTH,
  VIEWPORT_OFFSET,
} from "../utils";
import { toastState } from "./toast";
import { ToasterProps, State } from "../types";
import { Toast } from "./Item";
import styles from "./styles.css?inline";

export const Toaster = component$<ToasterProps>((props) => {
  useStyles$(styles);
  const {
    position = "bottom-right",
    hotkey = ["altKey", "KeyT"],
    expand = false,
    closeButton = false,
    class: className,
    offset,
    theme = "light",
    richColors,
    duration,
    style,
    visibleToasts = MAX_VISIBLE_TOASTS,
    toastOptions,
  } = props;

  const [x, y] = position.split("-");
  const keyShortcut = hotkey
    .join(" + ")
    .replace(/Key/g, "")
    .replace(/Digit/g, "");

  const listRef = useSignal<HTMLOListElement>();
  const state = useStore<State>({
    toasts: [],
    expanded: false,
    heights: [],
    interacting: false,
    theme,
  });

  // this is the relationship between the toast and the toaster
  useVisibleTask$(() => {
    return toastState.subscribe((toast) => {
      if (toast.dismiss) {
        state.toasts = state.toasts.map((t) =>
          t.id === toast.id ? { ...t, dismiss: true } : t
        );
        return;
      }

      state.toasts = [toast, ...state.toasts];
    });
  });

  useVisibleTask$(({ track }) => {
    const trackedTheme = track(() => theme);

    if (trackedTheme !== "system") {
      state.theme = trackedTheme;
      return;
    }

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", ({ matches }) => {
        state.theme = matches ? "dark" : "light";
      });
  });

  useTask$(({ track }) => {
    const tackedToasts = track(() => state.toasts);
    // Ensure expanded prop is always false when no toasts are present or only one left
    if (tackedToasts.length <= 1) {
      state.expanded = false;
    }
  });

  useOnDocument(
    "keydown",
    $((event: any) => {
      const isHotkeyPressed = hotkey.every(
        (key) => (event as any)[key] || event.code === key
      );

      if (isHotkeyPressed) {
        state.expanded = true;
        listRef.value?.focus();
      }

      if (
        event.code === "Escape" &&
        (document.activeElement === listRef.value ||
          listRef.value?.contains(document.activeElement))
      ) {
        state.expanded = false;
      }
    })
  );

  if (!state.toasts.length) return null;

  return (
    <section aria-label={`Show Notifications ${keyShortcut}`} tabIndex={-1}>
      <ol
        ref={listRef}
        class={className}
        tabIndex={-1}
        data-theme={theme}
        data-rich-colors={`${richColors}`}
        data-y-position={`${y}`}
        data-x-position={x}
        data-moick-toaster
        style={{
          "--front-toast-height": `${state.heights[0]?.height}px`,
          "--offset":
            typeof offset === "number"
              ? `${offset}px`
              : offset || VIEWPORT_OFFSET,
          "--width": `${TOAST_WIDTH}px`,
          "--gap": `${GAP}px`,
          ...style,
        }}
        onMouseEnter$={() => (state.expanded = true)}
        onMouseMove$={() => (state.expanded = true)}
        onMouseLeave$={() => {
          if (!state.interacting) {
            state.expanded = false;
          }
        }}
        onPointerDown$={() => {
          state.interacting = true;
        }}
        onPointerUp$={() => (state.interacting = false)}
      >
        {state.toasts.map((t, i) => {
          return (
            <Toast
              key={t.id}
              removeToast={$(() => {
                state.toasts = state.toasts.filter(
                  (toast) => toast.id !== t.id
                );
              })}
              toast={t}
              index={i}
              expandByDefault={expand}
              position={position}
              visibleToasts={visibleToasts}
              closeButton={closeButton}
              state={state}
              duration={duration}
              class={toastOptions?.class}
              descriptionClassName={toastOptions?.descriptionClassName}
              style={toastOptions?.style}
            />
          );
        })}
      </ol>
    </section>
  );
});
