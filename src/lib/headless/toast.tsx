import {
  $,
  component$,
  isBrowser,
  isSignal,
  useComputed$,
  useOnDocument,
  useSignal,
  useTask$,
} from "@qwik.dev/core";
import {
  isAction,
  SwipeDirection,
  ToastClassnames,
  ToastIcons,
  ToastProps,
} from "./types";
import { SWIPE_THRESHOLD, TIME_BEFORE_UNMOUNT, TOAST_LIFETIME } from "./const";
import { CloseIcon, getAsset, Loader } from "./icons";

function getDefaultSwipeDirections(position: string): Array<SwipeDirection> {
  const [y, x] = position.split("-");
  const directions: Array<SwipeDirection> = [];

  if (y) {
    directions.push(y as SwipeDirection);
  }

  if (x) {
    directions.push(x as SwipeDirection);
  }

  return directions;
}

export const Toast = component$<ToastProps>((props) => {
  // Stable props (do not change during a toast's lifetime) — safe to destructure.
  const {
    unstyled,
    visibleToasts,
    heights,
    expanded,
    removeToast,
    style,
    cancelButtonStyle,
    actionButtonStyle,
    class: localClass = "",
    descriptionClass = "",
    position,
    gap,
    loadingIcon: loadingIconProp,
    classes,
    icons,
    closeButtonAriaLabel = "Close toast",
  } = props;

  // Volatile props (`toast`, `index`, `toasts`, `interacting`, `closeButton`,
  // `duration`, `invert`, `expandByDefault`, `defaultRichColors`) are read via
  // `props.*` so render re-runs and tasks/computeds stay reactive.
  const toast = props.toast;
  const index = props.index;
  const toasts = props.toasts;
  const expandByDefault = props.expandByDefault;
  const defaultRichColors = props.defaultRichColors;

  // signals
  const swipeDirection = useSignal<"x" | "y" | null>(null);
  const swipeOutDirection = useSignal<
    "left" | "right" | "up" | "down" | null
  >(null);
  const mounted = useSignal<boolean>(false);
  const removed = useSignal<boolean>(false);
  const swiping = useSignal<boolean>(false);
  const swipeOut = useSignal<boolean>(false);
  const isSwiped = useSignal<boolean>(false);
  const offsetBeforeRemove = useSignal<number>(0);
  const initialHeight = useSignal<number>(0);
  const remainingTime = useSignal<number>(
    props.toast.duration || props.duration || TOAST_LIFETIME
  );
  const dragStartTime = useSignal<number | null>(null);
  const toastRef = useSignal<HTMLLIElement>();
  const closeTimerStartTimeRef = useSignal<number>(0);
  const lastCloseTimerStartTimeRef = useSignal<number>(0);
  const pointerStartRef = useSignal<{ x: number; y: number } | null>(null);
  const isDocumentHidden = useSignal<boolean>(false);

  // local constants
  const isFront = index === 0;
  const isVisible = index + 1 <= visibleToasts;
  const toastType = toast.type;
  const dismissible = toast.dismissible !== false;
  const toastClass = toast.class ?? "";
  const toastDescriptionClass = toast.descriptionClass ?? "";
  const [y, x] = position.split("-");

  // computed values — read volatile props via `props.*` so they recompute.
  const invert = useComputed$(() => {
    const toasterInvert = props.invert;
    const invertChecked = isSignal(toasterInvert)
      ? toasterInvert.value
      : toasterInvert;
    return Boolean(props.toast.invert ?? invertChecked ?? false);
  });
  const disabled = toastType === "loading";

  // Height index is used to calculate the offset as it gets updated before the
  // toast array, which means we can calculate the new layout faster.
  const heightIndex = useComputed$(() => {
    const idx = heights.value.findIndex((h) => h.toastId === props.toast.id);
    return idx === -1 ? 0 : idx;
  });
  const closeButton = useComputed$(
    () => props.toast.closeButton ?? props.closeButton
  );
  const duration = useComputed$(
    () => props.toast.duration || props.duration || TOAST_LIFETIME
  );
  const toastsHeightBefore = useComputed$(() => {
    return heights.value.reduce((prev, curr, reducerIndex) => {
      // Calculate offset up until current toast
      if (reducerIndex >= heightIndex.value) {
        return prev;
      }
      return prev + curr.height;
    }, 0);
  });
  const offset = useComputed$(() => {
    return heightIndex.value * gap + toastsHeightBefore.value;
  });

  // util functions
  const deleteToast = $(() => {
    // Save the offset for the exit swipe animation
    removed.value = true;
    offsetBeforeRemove.value = offset.value;
    heights.value = heights.value.filter((h) => h.toastId !== toast.id);

    setTimeout(() => {
      removeToast(toast);
    }, TIME_BEFORE_UNMOUNT);
  });

  function getLoadingIcon() {
    if (icons?.loading) {
      return (
        <div
          class={["sonner-loader", classes?.loader, toast?.classes?.loader]}
          data-visible={String(toastType === "loading")}
        >
          {icons.loading}
        </div>
      );
    }

    if (loadingIconProp) {
      return (
        <div
          class={["sonner-loader", classes?.loader, toast?.classes?.loader]}
          data-visible={String(toastType === "loading")}
        >
          {loadingIconProp}
        </div>
      );
    }

    return (
      <Loader
        class={[classes?.loader, toast?.classes?.loader]}
        visible={toastType === "loading"}
      />
    );
  }

  const iconFromIcons = toastType
    ? icons?.[toastType as keyof ToastIcons]
    : undefined;
  const icon =
    toast.icon ||
    iconFromIcons ||
    (toastType ? getAsset(toastType) : null);

  // tasks
  // Keep `remainingTime` in sync with the (possibly changing) duration.
  useTask$(({ track }) => {
    const d = track(() => duration.value);
    remainingTime.value = d;
  });

  // Trigger enter animation without using a visible task: defer the
  // `mounted` flip to the next animation frame so the CSS transition runs.
  useTask$(() => {
    if (!isBrowser) return;
    requestAnimationFrame(() => {
      mounted.value = true;
    });
  });

  // Add toast height to the heights array after it mounts; clean up on unmount.
  useTask$(({ track, cleanup }) => {
    const node = track(() => toastRef.value);
    track(() => props.toast.id);

    if (!node) return;

    const height = node.getBoundingClientRect().height;
    initialHeight.value = height;
    heights.value = [
      {
        toastId: props.toast.id,
        height,
        position: props.toast.position ?? position,
      },
      ...heights.value,
    ];

    cleanup(() => {
      heights.value = heights.value.filter(
        (h) => h.toastId !== props.toast.id
      );
    });
  });

  // Keep height up to date with the content in case it updates.
  useTask$(({ track }) => {
    const mountedNow = track(() => mounted.value);
    track(() => props.toast.title);
    track(() => props.toast.description);
    track(() => props.toast.jsx);
    track(() => props.toast.action);
    track(() => props.toast.cancel);

    const node = toastRef.value;
    if (!mountedNow || !node) return;

    const originalHeight = node.style.height;
    node.style.height = "auto";
    const newHeight = node.getBoundingClientRect().height;
    node.style.height = originalHeight;

    initialHeight.value = newHeight;

    const exists = heights.value.find((h) => h.toastId === props.toast.id);
    heights.value = exists
      ? heights.value.map((h) =>
          h.toastId === props.toast.id ? { ...h, height: newHeight } : h
        )
      : [
          {
            toastId: props.toast.id,
            height: newHeight,
            position: props.toast.position ?? position,
          },
          ...heights.value,
        ];
  });

  // Auto-close timer (pauses on hover/interaction or while the page is hidden).
  useTask$(({ track, cleanup }) => {
    track(() => expanded.value);
    track(() => props.interacting);
    track(() => isDocumentHidden.value);
    track(() => duration.value);
    const currentToast = track(() => props.toast);
    const currentType = currentToast.type;

    if (
      (currentToast.promise && currentType === "loading") ||
      currentToast.duration === Infinity ||
      currentType === "loading"
    ) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    // Pause the timer on each hover
    const pauseTimer = () => {
      if (lastCloseTimerStartTimeRef.value < closeTimerStartTimeRef.value) {
        // Get the elapsed time since the timer started
        const elapsedTime = Date.now() - closeTimerStartTimeRef.value;
        remainingTime.value = remainingTime.value - elapsedTime;
      }
      lastCloseTimerStartTimeRef.value = Date.now();
    };

    const startTimer = () => {
      // setTimeout(, Infinity) behaves as if the delay is 0.
      if (remainingTime.value === Infinity) return;
      closeTimerStartTimeRef.value = Date.now();

      // Let the toast know it has started
      timeoutId = setTimeout(() => {
        props.toast.onAutoClose$?.(props.toast);
        deleteToast();
      }, remainingTime.value);
    };

    if (expanded.value || props.interacting || isDocumentHidden.value) {
      pauseTimer();
    } else {
      startTimer();
    }

    cleanup(() => clearTimeout(timeoutId));
  });

  // Programmatic dismissal: the Toaster marks `delete` and we animate out.
  useTask$(({ track }) => {
    const shouldDelete = track(() => props.toast.delete);
    if (shouldDelete) {
      deleteToast();
      props.toast.onDismiss$?.(props.toast);
    }
  });

  useOnDocument(
    "visibilitychange",
    $(() => {
      isDocumentHidden.value = document.hidden;
    })
  );

  return (
    <li
      ref={toastRef}
      tabIndex={0}
      class={[
        localClass,
        toastClass,
        classes?.toast,
        toast?.classes?.toast,
        classes?.default,
        classes?.[toastType as keyof ToastClassnames],
        toast?.classes?.[toastType as keyof ToastClassnames],
      ]}
      data-sonner-toast=""
      data-rich-colors={String(Boolean(toast.richColors ?? defaultRichColors))}
      data-styled={String(!(toast.jsx || toast.unstyled || unstyled))}
      data-mounted={String(mounted.value)}
      data-promise={String(Boolean(toast.promise))}
      data-swiped={String(isSwiped.value)}
      data-removed={String(removed.value)}
      data-visible={String(isVisible)}
      data-y-position={y}
      data-x-position={x}
      data-index={index}
      data-front={String(isFront)}
      data-swiping={String(swiping.value)}
      data-dismissible={String(dismissible)}
      data-type={toastType}
      data-invert={String(invert.value)}
      data-swipe-out={String(swipeOut.value)}
      data-swipe-direction={swipeOutDirection.value ?? undefined}
      data-expanded={String(
        Boolean(expanded.value || (expandByDefault && mounted.value))
      )}
      data-testid={toast.testId}
      style={{
        "--index": index,
        "--toasts-before": index,
        "--z-index": toasts.length - index,
        "--offset": `${removed.value ? offsetBeforeRemove.value : offset.value}px`,
        "--initial-height": expandByDefault
          ? "auto"
          : `${initialHeight.value}px`,
        ...style,
        ...toast.style,
      }}
      onDragEnd$={() => {
        swiping.value = false;
        swipeDirection.value = null;
        pointerStartRef.value = null;
      }}
      onPointerDown$={(event) => {
        const current = props.toast;
        if (event.button === 2) return; // Return early on right click
        if (current.type === "loading" || current.dismissible === false) return;
        dragStartTime.value = Date.now();
        offsetBeforeRemove.value = offset.value;
        // Maintain pointer capture even when going outside of the toast.
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
        if ((event.target as HTMLElement).tagName === "BUTTON") return;
        swiping.value = true;
        pointerStartRef.value = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp$={() => {
        if (swipeOut.value || props.toast.dismissible === false) return;

        pointerStartRef.value = null;
        const swipeAmountX = Number(
          toastRef.value?.style
            .getPropertyValue("--swipe-amount-x")
            .replace("px", "") || 0
        );
        const swipeAmountY = Number(
          toastRef.value?.style
            .getPropertyValue("--swipe-amount-y")
            .replace("px", "") || 0
        );
        const timeTaken = Date.now() - (dragStartTime.value ?? Date.now());

        const swipeAmount =
          swipeDirection.value === "x" ? swipeAmountX : swipeAmountY;
        const velocity = Math.abs(swipeAmount) / timeTaken;

        if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
          offsetBeforeRemove.value = offset.value;
          props.toast.onDismiss$?.(props.toast);

          if (swipeDirection.value === "x") {
            swipeOutDirection.value = swipeAmountX > 0 ? "right" : "left";
          } else {
            swipeOutDirection.value = swipeAmountY > 0 ? "down" : "up";
          }

          deleteToast();
          swipeOut.value = true;
          return;
        } else {
          toastRef.value?.style.setProperty("--swipe-amount-x", "0px");
          toastRef.value?.style.setProperty("--swipe-amount-y", "0px");
        }
        isSwiped.value = false;
        swiping.value = false;
        swipeDirection.value = null;
      }}
      onPointerMove$={(event) => {
        if (!pointerStartRef.value || props.toast.dismissible === false) return;

        const isHighlighted =
          (window.getSelection()?.toString().length ?? 0) > 0;
        if (isHighlighted) return;

        const yDelta = event.clientY - pointerStartRef.value.y;
        const xDelta = event.clientX - pointerStartRef.value.x;

        const swipeDirections =
          props.swipeDirections ?? getDefaultSwipeDirections(props.position);

        // Determine swipe direction if not already locked
        if (
          !swipeDirection.value &&
          (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)
        ) {
          swipeDirection.value =
            Math.abs(xDelta) > Math.abs(yDelta) ? "x" : "y";
        }

        const swipeAmount = { x: 0, y: 0 };

        const getDampening = (delta: number) => {
          const factor = Math.abs(delta) / 20;
          return 1 / (1.5 + factor);
        };

        // Only apply swipe in the locked direction
        if (swipeDirection.value === "y") {
          if (
            swipeDirections.includes("top") ||
            swipeDirections.includes("bottom")
          ) {
            if (
              (swipeDirections.includes("top") && yDelta < 0) ||
              (swipeDirections.includes("bottom") && yDelta > 0)
            ) {
              swipeAmount.y = yDelta;
            } else {
              // Smoothly transition to dampened movement
              const dampenedDelta = yDelta * getDampening(yDelta);
              swipeAmount.y =
                Math.abs(dampenedDelta) < Math.abs(yDelta)
                  ? dampenedDelta
                  : yDelta;
            }
          }
        } else if (swipeDirection.value === "x") {
          if (
            swipeDirections.includes("left") ||
            swipeDirections.includes("right")
          ) {
            if (
              (swipeDirections.includes("left") && xDelta < 0) ||
              (swipeDirections.includes("right") && xDelta > 0)
            ) {
              swipeAmount.x = xDelta;
            } else {
              // Smoothly transition to dampened movement
              const dampenedDelta = xDelta * getDampening(xDelta);
              swipeAmount.x =
                Math.abs(dampenedDelta) < Math.abs(xDelta)
                  ? dampenedDelta
                  : xDelta;
            }
          }
        }

        if (Math.abs(swipeAmount.x) > 0 || Math.abs(swipeAmount.y) > 0) {
          isSwiped.value = true;
        }

        // Apply transform using both x and y values
        toastRef.value?.style.setProperty(
          "--swipe-amount-x",
          `${swipeAmount.x}px`
        );
        toastRef.value?.style.setProperty(
          "--swipe-amount-y",
          `${swipeAmount.y}px`
        );
      }}
    >
      {closeButton.value && !toast.jsx && toastType !== "loading" ? (
        <button
          aria-label={closeButtonAriaLabel}
          data-disabled={String(disabled)}
          data-close-button
          onClick$={
            disabled || !dismissible
              ? () => {}
              : [deleteToast, $(() => props.toast.onDismiss$?.(props.toast))]
          }
          class={[classes?.closeButton, toast?.classes?.closeButton]}
        >
          {icons?.close ?? CloseIcon}
        </button>
      ) : null}

      {(toastType || toast.icon || toast.promise) &&
      toast.icon !== null &&
      (iconFromIcons !== null || toast.icon) ? (
        <div data-icon="" class={[classes?.icon, toast?.classes?.icon]}>
          {toast.promise || (toastType === "loading" && !toast.icon)
            ? toast.icon || getLoadingIcon()
            : null}
          {toastType !== "loading" ? icon : null}
        </div>
      ) : null}

      <div data-content="" class={[classes?.content, toast?.classes?.content]}>
        <div data-title="" class={[classes?.title, toast?.classes?.title]}>
          {toast.jsx
            ? toast.jsx
            : typeof toast.title === "function"
              ? toast.title()
              : toast.title}
        </div>
        {toast.description ? (
          <div
            data-description=""
            class={[
              descriptionClass,
              toastDescriptionClass,
              classes?.description,
              toast?.classes?.description,
            ]}
          >
            {typeof toast.description === "function"
              ? toast.description()
              : toast.description}
          </div>
        ) : null}
      </div>

      {toast.cancel && isAction(toast.cancel) ? (
        <button
          data-button
          data-cancel
          style={toast.cancelButtonStyle ?? cancelButtonStyle}
          onClick$={(event, target) => {
            // We need to check twice because typescript
            if (!isAction(toast.cancel)) return;
            if (!dismissible) return;
            if (toast.cancel.onClick$) toast.cancel.onClick$(event, target);
            deleteToast();
          }}
          class={[classes?.cancelButton, toast?.classes?.cancelButton]}
        >
          {toast.cancel.label}
        </button>
      ) : toast.cancel ? (
        toast.cancel
      ) : null}

      {toast.action && isAction(toast.action) ? (
        <button
          data-button
          data-action
          style={toast.actionButtonStyle ?? actionButtonStyle}
          preventdefault:click={toast.action.preventDefault}
          onClick$={(event, target) => {
            // We need to check twice because typescript
            if (!isAction(toast.action)) return;
            toast.action.onClick$(event, target);
            if (toast.action.preventDefault) return;
            deleteToast();
          }}
          class={[classes?.actionButton, toast?.classes?.actionButton]}
        >
          {toast.action.label}
        </button>
      ) : toast.action ? (
        toast.action
      ) : null}
    </li>
  );
});
