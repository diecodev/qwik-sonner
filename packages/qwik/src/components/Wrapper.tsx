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
  TOAST_WIDTH,
  DEFAULT_WRAPPER_OPTIONS,
  createOptionsObject
} from "../utils";
import { toastState } from "./state";
import { State, Theme, ToasterProps } from "../types";
import { Toast } from "./Toast";
import styles from "./styles.css?inline";

export const Toaster = component$<ToasterProps>((props) => {
  const opts = createOptionsObject<Required<ToasterProps>>(DEFAULT_WRAPPER_OPTIONS, props);
  useStyles$(styles);

  const wrapperRef = useSignal<HTMLOListElement>();
  const state = useStore<State>({
    toasts: [],
    expanded: opts.expand,
    heights: [],
    interacting: false,
    theme: opts.theme,
  });

  const [y, x] = opts.position.split("-");
  const keyShortcut = opts.hotkey
    .join(" + ")
    .replace(/Key/g, "")
    .replace(/Digit/g, "");
  const offset = typeof opts.offset === "number"
    ? `${opts.offset}px`
    : opts.offset

  // this is the relationship between the toast and the this component
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

  // handle user color theme preference
  useVisibleTask$(({ track }) => {
    const theme = track(() => opts.theme);

    if (theme !== Theme.system) {
      state.theme = theme;
      return;
    }

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", ({ matches }) => {
        state.theme = matches ? Theme.dark : Theme.light;
      });
  });

  // Ensure expanded prop is always false when no toasts are present or only one left
  useTask$(({ track }) => {
    track(() => state.toasts);
    if (state.toasts.length <= 1) {
      state.expanded = false;
    }
  });

  // Create shortcut to expand the toaster
  useOnDocument(
    "keydown",
    $((event: any) => {
      // Check if all hotkeys are pressed
      const isHotkeyPressed = opts.hotkey.every(
        (key) => (event as any)[key] || event.code === key
      );

      // If the key shortcut is pressed, expand the toaster
      if (isHotkeyPressed) {
        state.expanded = true;
        wrapperRef.value?.focus();
      }

      // Then, if user presses escape, close the toaster
      if (
        event.code === "Escape" &&
        (document.activeElement === wrapperRef.value ||
          wrapperRef.value?.contains(document.activeElement))
      ) {
        state.expanded = false;
      }
    })
  );

  // There are not toasts to show = no need to render
  if (!state.toasts.length) return null;

  // render the toasts
  return (
    <section aria-label={`Notifications ${keyShortcut}`} tabIndex={-1}>
      <ol
        ref={wrapperRef}
        class={opts.class}
        tabIndex={-1}
        moick-data-theme={state.theme}
        moick-rich-colors={`${opts.richColors}`}
        moick-y-position={y}
        moick-x-position={x}
        moick-toaster-wrapper
        style={{
          "--front-toast-height": `${state.heights[0]?.height}px`,
          "--offset": `${offset}`,
          "--width": `${TOAST_WIDTH}px`,
          "--gap": `${GAP}px`,
          ...opts.style,
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
              expandByDefault={opts.expand}
              position={opts.position}
              visibleToasts={opts.visibleToasts}
              closeButton={opts.closeButton}
              state={state}
              duration={opts.duration}
              class={opts.toastOptions.class}
              descriptionClassName={opts.toastOptions.descriptionClassName}
              style={opts.toastOptions.style}
            />
          );
        })}
      </ol>
    </section>
  );
});
