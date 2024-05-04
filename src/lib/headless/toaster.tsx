/* eslint-disable qwik/valid-lexical-scope */
import {
  $,
  component$,
  useComputed$,
  useOnDocument,
  useSignal,
  useStore,
  useTask$,
  useOnWindow,
} from "@builder.io/qwik";
import {
  Dir,
  Theme,
  ToastT,
  ToastToDismiss,
  ToasterProps,
  ToasterStore,
  toastState,
} from "../core";
import { Toast } from "./toast-card";

// function getDocumentDirection(): Dir {
//   if (typeof window === "undefined") return "ltr";
//   if (typeof document === "undefined") return "ltr"; // For Fresh purpose

//   const dirAttribute = document.documentElement.getAttribute("dir");

//   if (dirAttribute === "auto" || !dirAttribute) {
//     return window.getComputedStyle(document.documentElement).direction as Dir;
//   }

//   return dirAttribute as Dir;
// }

export const Toaster = component$<ToasterProps & { toastWidth: number }>(
  (props) => {
    const isInitializedSig = useSignal<boolean>(false);

    const {
      position,
      hotkey,
      theme,
      visibleToasts,
      dir,
      containerAriaLabel,
      expand,
      toastOptions,
      closeButton,
      invert,
      gap,
      loadingIcon,
      offset,
      richColors,
      duration,
      ...restProps
    } = props;

    const listRef = useSignal<HTMLOListElement>();
    const state = useStore<ToasterStore>({
      toasts: [],
      expanded: expand!,
      heights: [],
      interacting: false,
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

    const hotkeyLabel = hotkey!
      .join("+")
      .replace(/Key/g, "")
      .replace(/Digit/g, "");

    const lastFocusedElementRef = useSignal<HTMLElement>();
    const isFocusWithinRef = useSignal<boolean>(false);

    const removeToast = $(
      (toast: ToastT) =>
        (state.toasts = state.toasts.filter(({ id }) => id !== toast.id))
    );

    useOnWindow(
      "DOMContentLoaded",
      $(() => {
        const userTheme = listRef.value?.getAttribute("data-theme") as Theme;

        // if there is a default theme that is not "system", return
        if (userTheme !== "system") return;

        // reading the qwik script to handle user theme preferences
        const themeFromLocalStorage = localStorage.getItem("theme") as Theme;

        if (themeFromLocalStorage) {
          listRef.value!.setAttribute("data-theme", themeFromLocalStorage);
          return;
        }

        const themeFromMedia: Theme =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";

        listRef.value!.setAttribute("data-theme", themeFromMedia);
        localStorage.setItem("theme", themeFromMedia);
      })
    );

    useOnWindow(
      "DOMContentLoaded",
      $(() => {
        if (dir && dir !== "auto") return;

        const newDir = window.getComputedStyle(document.documentElement)
          .direction as Dir;
        listRef.value!.setAttribute("dir", newDir);

        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (
              mutation.type === "attributes" &&
              mutation.attributeName === "dir"
            ) {
              const value = (mutation.target as HTMLElement).getAttribute(
                "dir"
              );
              if (value === "auto" || !value) {
                const dir = window.getComputedStyle(document.documentElement)
                  .direction as Dir;
                return listRef.value!.setAttribute("dir", dir);
              }
              listRef.value!.setAttribute("dir", value as Dir);
            }
          });
        });

        observer.observe(document.querySelector("html")!, {
          attributes: true,
          attributeFilter: ["dir"],
        });
      })
    );

    useOnDocument(
      "keydown",
      $((event) => {
        // Check if all hotkeys are pressed
        const isHotkeyPressed = hotkey!.every(
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
      if (state.toasts.length <= 1) {
        state.expanded = false;
      }
    });

    const onFocusOutHandler = $(
      (event: FocusEvent, element: HTMLOListElement) => {
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
      }
    );

    const onFocusHandler = $((event: FocusEvent, element: HTMLOListElement) => {
      const isNotDismissible = element.dataset.dismissible === "false";

      if (isNotDismissible) return;

      if (!isFocusWithinRef.value) {
        isFocusWithinRef.value = true;
        lastFocusedElementRef.value = event.relatedTarget as HTMLElement;
      }
    });

    const onMouseleaveHandler = $(() => {
      // Avoid setting expanded to false when interacting with a toast, e.g. swiping
      if (!state.interacting) {
        state.expanded = false;
      }
    });

    const onPointerDownHandler = $(
      (_: PointerEvent, element: HTMLOListElement) => {
        const isNotDismissible = element.dataset.dismissible === "false";

        if (isNotDismissible) return;
        state.interacting = true;
      }
    );

    const makeToasterExpanded = $(() => (state.expanded = true));

    return (
      // Remove item from normal navigation flow, only available via hotkey
      <section
        aria-label={`${containerAriaLabel} ${hotkeyLabel}`}
        tabIndex={-1}
      >
        {possiblePositions.value.map((position, index) => {
          const [y, x] = position!.split("-");
          return (
            <ol
              {...restProps}
              id="sonner-toaster"
              key={position}
              dir={dir}
              tabIndex={-1}
              ref={listRef}
              class={props.class}
              data-qwik-toaster
              data-theme={theme ?? "system"}
              data-rich-colors={`${richColors}`}
              data-y-position={y}
              data-x-position={x}
              style={{
                "--front-toast-height": `${state.heights[0]?.height}px`,
                "--offset": typeof offset === "number" ? `${offset}px` : offset,
                "--width": `${props.toastWidth}px`,
                "--gap": `${gap}px`,
                ...props.style,
              }}
              onFocusOut$={[onFocusOutHandler, props.onFocusOut$]}
              onFocusIn$={[onFocusHandler, props.onFocus$]}
              onMouseEnter$={[makeToasterExpanded, props.onMouseEnter$]}
              onMouseMove$={[makeToasterExpanded, props.onMouseMove$]}
              onMouseLeave$={[onMouseleaveHandler, props.onMouseLeave$]}
              onPointerDown$={[onPointerDownHandler, props.onPointerDown$]}
              onPointerUp$={[
                $(() => (state.interacting = false)),
                props.onPointerUp$,
              ]}
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
                    duration={toastOptions?.duration ?? duration!}
                    // eslint-disable-next-line qwik/no-react-props
                    className={toastOptions?.className}
                    descriptionClassName={toastOptions?.descriptionClassName}
                    invert={invert!}
                    visibleToasts={visibleToasts!}
                    closeButton={closeButton!}
                    position={position!}
                    style={toastOptions?.style}
                    unstyled={toastOptions?.unstyled}
                    classNames={toastOptions?.classNames}
                    cancelButtonStyle={toastOptions?.cancelButtonStyle}
                    actionButtonStyle={toastOptions?.actionButtonStyle}
                    removeToast={removeToast}
                    expandByDefault={expand!}
                    gap={gap!}
                    loadingIcon={loadingIcon}
                    state={state}
                  />
                ))}
            </ol>
          );
        })}
      </section>
    );
  }
);
