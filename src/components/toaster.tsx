/* eslint-disable qwik/valid-lexical-scope */
import {
  $,
  component$,
  useComputed$,
  useOnDocument,
  useSignal,
  useStore,
  useStyles$,
  useTask$,
  useOnWindow,
  sync$,
} from "@builder.io/qwik";
import {
  Theme,
  ToastT,
  ToastToDismiss,
  ToasterProps,
  ToasterStore,
} from "../utils/types";
import { Toast } from "./toast-card";
import {
  GAP,
  TOAST_WIDTH,
  VIEWPORT_OFFSET,
  VISIBLE_TOASTS_AMOUNT,
} from "../constants";
import styles from "./styles.css?inline";
import { toastState } from "../utils/state";

function getDocumentDirection(): ToasterProps["dir"] {
  if (typeof window === "undefined") return "ltr";
  if (typeof document === "undefined") return "ltr"; // For Fresh purpose

  const dirAttribute = document.documentElement.getAttribute("dir");

  if (dirAttribute === "auto" || !dirAttribute) {
    return window.getComputedStyle(document.documentElement)
      .direction as ToasterProps["dir"];
  }

  return dirAttribute as ToasterProps["dir"];
}

export const Toaster = component$<ToasterProps>((props) => {
  useStyles$(styles);
  const isInitializedSig = useSignal<boolean>(false);

  const {
    position = "bottom-right",
    hotkey = ["altKey", "KeyT"],
    theme = "light",
    visibleToasts = VISIBLE_TOASTS_AMOUNT,
    dir = getDocumentDirection(),
    containerAriaLabel = "Notifications",
    expand = false,
  } = props;

  const listRef = useSignal<HTMLOListElement>();

  const state = useStore<ToasterStore>({
    toasts: [],
    expanded: expand,
    heights: [],
    interacting: false,
    theme,
  });

  useOnDocument(
    "sonner",
    $((ev: CustomEvent) => {
      if (isInitializedSig.value) return;
      isInitializedSig.value = true;

      state.toasts = [...state.toasts, ev.detail];

      toastState.subscribe((toast) => {
        if ((toast as ToastToDismiss).dismiss) {
          state.toasts = state.toasts.map((t) =>
            t.id === toast.id ? { ...t, delete: true } : t
          );
          return;
        }

        const indexOfExistingToast = state.toasts.findIndex(
          (t) => t.id === toast.id
        );

        // Update the toast if it already exists
        if (indexOfExistingToast !== -1) {
          state.toasts = [
            ...state.toasts.slice(0, indexOfExistingToast),
            { ...state.toasts[indexOfExistingToast], ...toast },
            ...state.toasts.slice(indexOfExistingToast + 1),
          ];
          return;
        }

        return (state.toasts = [toast, ...state.toasts]);
      });
    })
  );

  const possiblePositions = useComputed$(() => {
    return Array.from(
      new Set(
        [props.position ?? position].concat(
          state.toasts
            .filter((toast) => toast.position!)
            .map((toast) => toast.position!)
        )
      )
    );
  });

  const hotkeyLabel = hotkey
    .join("+")
    .replace(/Key/g, "")
    .replace(/Digit/g, "");

  const lastFocusedElementRef = useSignal<HTMLElement>();
  const isFocusWithinRef = useSignal<boolean>(false);

  const removeToast = $(
    (toast: ToastT) =>
      (state.toasts = state.toasts.filter(({ id }) => id !== toast.id))
  );

  // do not use DOMContentLoaded this unless using a sync$
  useOnWindow(
    "DOMContentLoaded",
    sync$((e: Event) => {
      const documentEl = e.target as Document;
      const list = documentEl.getElementById("toaster");
      const userTheme = list?.getAttribute("data-theme") as Theme;

      if (userTheme === "system") {
        const themeFromLocalStorage = localStorage.getItem("theme");

        console.log(themeFromLocalStorage);

        if (themeFromLocalStorage) {
          return list?.setAttribute("data-theme", themeFromLocalStorage);
        }

        const themeFromMedia =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";

        list?.setAttribute("data-theme", themeFromMedia);
        localStorage.setItem("theme", themeFromMedia);
      }
    })
  );

  useOnDocument(
    "keydown",
    $((event) => {
      // Check if all hotkeys are pressed
      const isHotkeyPressed = hotkey.every(
        (key) => (event as any)[key] || event.code === key
      );

      // If the key shortcut is pressed, expand the toaster
      if (isHotkeyPressed) {
        state.expanded = true;
        listRef.value?.focus();
      }

      // Then, if user presses escape, close the toaster
      if (
        event.code === "Escape" &&
        (document.activeElement === listRef.value ||
          listRef.value?.contains(document.activeElement))
      ) {
        state.expanded = false;
      }
    })
  );

  useTask$(({ track }) => {
    track(() => state.toasts);
    if (state.toasts.length <= 1 && state.expanded) {
      state.expanded = false;
    }
  });

  const handlePointerDown$ = $((_: Event, element: HTMLElement) => {
    console.log("own");
    const isNotDismissible = element.dataset.dismissible === "false";

    if (isNotDismissible) return;
    state.interacting = true;
  });

  const handleMouseLeave$ = $(() => {
    // Avoid setting expanded to false when interacting with a toast, e.g. swiping
    if (!state.interacting) {
      state.expanded = false;
    }
  });

  const handleFocus$ = $((event: FocusEvent, element: HTMLOListElement) => {
    const isNotDismissible = element.dataset.dismissible === "false";

    if (isNotDismissible) return;

    if (!isFocusWithinRef.value) {
      isFocusWithinRef.value = true;
      lastFocusedElementRef.value = event.relatedTarget as HTMLElement;
    }
  });

  const handleBlur$ = $((event: FocusEvent, element: HTMLElement) => {
    if (
      isFocusWithinRef.value &&
      !element.contains(event.relatedTarget as Node)
    ) {
      isFocusWithinRef.value = false;
      if (lastFocusedElementRef.value) {
        lastFocusedElementRef.value.focus({ preventScroll: true });
        lastFocusedElementRef.value = undefined;
      }
    }
  });

  return (
    // Remove item from normal navigation flow, only available via hotkey
    <section aria-label={`${containerAriaLabel} ${hotkeyLabel}`} tabIndex={-1}>
      {possiblePositions.value.map((position, index) => {
        const [y, x] = position.split("-");
        return (
          <ol
            key={position}
            id="toaster"
            dir={dir === "auto" ? getDocumentDirection() : dir}
            tabIndex={-1}
            ref={listRef}
            class={props.className}
            data-moick-toaster
            data-theme={state.theme}
            data-rich-colors={`${props.richColors}`}
            data-y-position={y}
            data-x-position={x}
            style={{
              "--front-toast-height": `${state.heights[0]?.height}px`,
              "--offset":
                typeof props.offset === "number"
                  ? `${props.offset}px`
                  : props.offset || VIEWPORT_OFFSET,
              "--width": `${TOAST_WIDTH}px`,
              "--gap": `${props.gap ?? GAP}px`,
              ...props.style,
            }}
            onBlur$={[handleBlur$, props.onBlur$]}
            onFocus$={[handleFocus$, props.onFocus$]}
            onMouseEnter$={[
              $(() => (state.expanded = true)),
              props.onMouseEnter$,
            ]}
            onMouseMove$={[
              $(() => (state.expanded = true)),
              props.onMouseMove$,
            ]}
            onMouseLeave$={[handleMouseLeave$, props.onMouseLeave$]}
            onPointerDown$={[handlePointerDown$, props.onPointerDown$]}
            onPointerUp$={[
              $(() => (state.interacting = false)),
              props.onPointerUp$,
            ]}
            {...props}
          >
            {state.toasts
              .filter(
                (toast) =>
                  (!toast.position && index === 0) ||
                  toast.position === position
              )
              .map((toast, index) => (
                <Toast
                  key={toast.id}
                  index={index}
                  toast={toast}
                  duration={props.toastOptions?.duration ?? props.duration}
                  // eslint-disable-next-line qwik/no-react-props
                  className={props.toastOptions?.className}
                  descriptionClassName={
                    props.toastOptions?.descriptionClassName
                  }
                  invert={props.invert ?? false}
                  visibleToasts={visibleToasts}
                  closeButton={props.closeButton ?? false}
                  position={position}
                  style={props.toastOptions?.style}
                  unstyled={props.toastOptions?.unstyled}
                  classNames={props.toastOptions?.classNames}
                  cancelButtonStyle={props.toastOptions?.cancelButtonStyle}
                  actionButtonStyle={props.toastOptions?.actionButtonStyle}
                  removeToast={removeToast}
                  expandByDefault={expand}
                  gap={props.gap}
                  loadingIcon={props.loadingIcon}
                  state={state}
                />
              ))}
          </ol>
        );
      })}
    </section>
  );
});
