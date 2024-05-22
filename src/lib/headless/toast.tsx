import {
  $,
  component$,
  useComputed$,
  useSignal,
  useTask$,
  isSignal,
  useOnDocument,
  useVisibleTask$,
} from "@builder.io/qwik";
import { isAction, ToastClassnames, ToastIcons, ToastProps } from "./types";
import { SWIPE_THRESHOLD, TIME_BEFORE_UNMOUNT, TOAST_LIFETIME } from "./const";
import { getAsset, Loader } from "./icons";
import DOMPurify from "dompurify";

export const Toast = component$<ToastProps>((props) => {
  const {
    invert: ToasterInvert,
    toast,
    unstyled,
    interacting,
    visibleToasts,
    heights,
    index,
    toasts,
    expanded,
    removeToast,
    closeButton: closeButtonFromToaster,
    style,
    cancelButtonStyle,
    actionButtonStyle,
    class: localClass = "",
    descriptionClass = "",
    duration: durationFromToaster,
    position,
    gap,
    loadingIcon: loadingIconProp,
    expandByDefault,
    classes,
    icons,
    closeButtonAriaLabel = "Close toast",
    pauseWhenPageIsHidden,
  } = props;

  // signals
  const mounted = useSignal<boolean>(false);
  const removed = useSignal<boolean>(false);
  const swiping = useSignal<boolean>(false);
  const swipeOut = useSignal<boolean>(false);
  const offsetBeforeRemove = useSignal<number>(0);
  const initialHeight = useSignal<number>(0);
  const dragStartTime = useSignal<Date | null>(null);
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
  const invertChecked = isSignal<boolean>(ToasterInvert)
    ? ToasterInvert.value
    : ToasterInvert;
  const invert = useComputed$(() => toast.invert ?? invertChecked);
  const disabled = toastType === "loading";

  // computed values
  // Height index is used to calculate the offset as it gets updated before the toast array, which means we can calculate the new layout faster.
  const heightIndex = useComputed$(() => {
    const hSet = Array.from(new Set(heights.value.map((h) => h.toastId)));
    const idx = hSet.findIndex((id) => id === toast.id) || 0;
    return idx === -1 ? 0 : idx;
  });
  const closeButton = useComputed$(
    () => toast.closeButton ?? closeButtonFromToaster
  );
  const duration = useComputed$(
    () => toast.duration ?? durationFromToaster ?? TOAST_LIFETIME
  );
  const toastsHeightBefore = useComputed$(() => {
    return heights.value.reduce((prev, curr, reducerIndex) => {
      // Calculate offset up until current  toast
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
        <div class="qwik-loader" data-visible={String(toastType === "loading")}>
          {icons.loading}
        </div>
      );
    }

    if (loadingIconProp) {
      return (
        <div class="qwik-loader" data-visible={String(toastType === "loading")}>
          {loadingIconProp}
        </div>
      );
    }
    return <Loader visible={toastType === "loading"} />;
  }
  function sanitizeHTML(html: string | Node): string {
    return DOMPurify.sanitize(html);
  }

  // tasks
  useTask$(({ track }) => {
    track(() => toastRef.value);

    if (!toastRef.value) return;

    const originalHeight = toastRef.value.style.height;
    toastRef.value.style.height = "auto";
    const newHeight = toastRef.value.getBoundingClientRect().height;
    toastRef.value.style.height = originalHeight;

    initialHeight.value = newHeight;
    const exists = heights.value.find((h) => h.toastId === toast.id);

    heights.value = exists
      ? heights.value.map((h) =>
          h.toastId === toast.id ? { ...h, height: newHeight } : h
        )
      : [{ toastId: toast.id, height: newHeight, position }, ...heights.value];
  });
  useTask$(({ track, cleanup }) => {
    track(() => expanded.value);
    track(() => interacting);
    track(() => expandByDefault);
    track(() => toast);
    let remainingTime = track(() => duration.value);
    track(() => toast.promise);
    track(() => toastType);
    track(() => pauseWhenPageIsHidden);
    track(() => isDocumentHidden.value);

    if (
      (toast.promise && toastType === "loading") ||
      toast.duration === Infinity ||
      toast.type === "loading"
    )
      return;
    let timeoutId: number;

    // Pause the timer on each hover
    const pauseTimer = () => {
      if (lastCloseTimerStartTimeRef.value < closeTimerStartTimeRef.value) {
        // Get the elapsed time since the timer started
        const elapsedTime = new Date().getTime() - closeTimerStartTimeRef.value;

        remainingTime = remainingTime - elapsedTime;
      }

      lastCloseTimerStartTimeRef.value = new Date().getTime();
    };

    const startTimer = () => {
      // setTimeout(, Infinity) behaves as if the delay is 0.
      // As a result, the toast would be closed immediately, giving the appearance that it was never rendered.
      // See: https://github.com/denysdovhan/wtfjs?tab=readme-ov-file#an-infinite-timeout
      if (remainingTime === Infinity) return;

      closeTimerStartTimeRef.value = new Date().getTime();

      // Let the toast know it has started
      timeoutId = setTimeout(() => {
        toast.onAutoClose$?.(toast);
        deleteToast();
      }, remainingTime);
    };

    if (
      expanded.value ||
      interacting ||
      (pauseWhenPageIsHidden && isDocumentHidden.value)
    ) {
      pauseTimer();
    } else {
      startTimer();
    }

    cleanup(() => clearTimeout(timeoutId));
  });
  useTask$(({ track, cleanup }) => {
    track(() => toastRef.value);
    track(() => toast.id);

    if (!toastRef.value) return;

    const height = toastRef.value.getBoundingClientRect().height;

    // Add toast height tot heights array after the toast is mounted
    initialHeight.value = height;
    heights.value = [
      {
        toastId: toast.id,
        height,
        position: toast.position ?? "bottom-right",
      },
      ...heights.value,
    ];

    cleanup(
      () =>
        (heights.value = heights.value.filter((h) => h.toastId !== toast.id))
    );
  });
  useTask$(({ track }) => {
    track(() => toast.delete);
    track(() => deleteToast);

    if (toast.delete) {
      deleteToast();
    }
  });

  useOnDocument(
    "visibilitychange",
    $(() => {
      isDocumentHidden.value = document.hidden;
    })
  );

  // I shoudl not use visible task but I don't found a better way to do it
  useVisibleTask$(({ track }) => {
    const localMount = track(() => mounted.value);
    if (!localMount) {
      mounted.value = true;
    }
  });

  return (
    <li
      ref={toastRef}
      aria-live={toast.important ? "assertive" : "polite"}
      aria-atomic="true"
      role="status"
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
      data-qwik-toast=""
      data-styled={String(!Boolean(toast.jsx || toast.unstyled || unstyled))}
      data-mounted={String(mounted.value)}
      data-promise={String(Boolean(toast.promise))}
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
      data-expanded={String(
        Boolean(expanded.value || (expandByDefault && mounted.value))
      )}
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
      onPointerDown$={(event, target) => {
        if (disabled || !dismissible) return;
        dragStartTime.value = new Date();
        offsetBeforeRemove.value = offset.value;
        // Ensure we maintain correct pointer capture even when going outside of the toast (e.g. when swiping)
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
        if (target.tagName === "BUTTON") return;
        swiping.value = true;
        pointerStartRef.value = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp$={() => {
        if (swipeOut.value || !dismissible) return;

        pointerStartRef.value = null;
        const swipeAmount = Number(
          toastRef.value?.style
            .getPropertyValue("--swipe-amount")
            .replace("px", "") ?? 0
        );
        const timeTaken =
          new Date().getTime() - (dragStartTime.value as Date)?.getTime();
        const velocity = Math.abs(swipeAmount) / timeTaken;

        // Remove only if threshold is met
        if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
          offsetBeforeRemove.value = offset.value;
          toast.onDismiss$?.(toast);
          deleteToast();
          swipeOut.value = true;
          return;
        }

        toastRef.value?.style.setProperty("--swipe-amount", "0px");
        swiping.value = false;
      }}
      onPointerMove$={(event) => {
        if (!pointerStartRef.value || !dismissible) return;

        const yPosition = event.clientY - pointerStartRef.value.y;
        const xPosition = event.clientX - pointerStartRef.value.x;

        const clamp = y === "top" ? Math.min : Math.max;
        const clampedY = clamp(0, yPosition);
        const swipeStartThreshold = event.pointerType === "touch" ? 10 : 2;
        const isAllowedToSwipe = Math.abs(clampedY) > swipeStartThreshold;

        if (isAllowedToSwipe) {
          toastRef.value?.style.setProperty("--swipe-amount", `${yPosition}px`);
        } else if (Math.abs(xPosition) > swipeStartThreshold) {
          // User is swiping in wrong direction so we disable swipe gesture
          // for the current pointer down interaction
          pointerStartRef.value = null;
        }
      }}
    >
      {closeButton.value && !toast.jsx ? (
        <button
          aria-label={closeButtonAriaLabel}
          data-disabled={String(disabled)}
          data-close-button
          onClick$={
            disabled || !dismissible
              ? () => {}
              : [deleteToast, $(() => toast.onDismiss$?.(toast))]
          }
          class={[classes?.closeButton, toast?.classes?.closeButton]}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      ) : null}
      {toast.jsx ?? typeof toast.title === "object" ? (
        toast.jsx ?? toast.title
      ) : (
        <>
          {toastType || toast.icon || toast.promise ? (
            <div data-icon="" class={[classes?.icon, toast?.classes?.icon]}>
              {toast.promise || (toast.type === "loading" && !toast.icon)
                ? toast.icon ?? getLoadingIcon()
                : null}
              {toast.type !== "loading"
                ? toast.icon ??
                  icons?.[toastType as keyof ToastIcons] ??
                  getAsset(toastType!)
                : null}
            </div>
          ) : null}

          <div
            data-content=""
            class={[classes?.content, toast?.classes?.content]}
          >
            <div
              data-title=""
              class={[classes?.title, toast?.classes?.title]}
              dangerouslySetInnerHTML={sanitizeHTML(toast.title as string)}
            ></div>
            {toast.description ? (
              typeof toast.description === "string" ? (
                <div
                  data-description=""
                  class={[
                    descriptionClass,
                    toastDescriptionClass,
                    classes?.description,
                    toast?.classes?.description,
                  ]}
                  dangerouslySetInnerHTML={sanitizeHTML(toast.description)}
                />
              ) : (
                <div
                  data-description=""
                  class={[
                    descriptionClass,
                    toastDescriptionClass,
                    classes?.description,
                    toast?.classes?.description,
                  ]}
                >
                  {toast.description}
                </div>
              )
            ) : null}
          </div>
          {typeof toast.cancel === "function" ? (
            toast.cancel
          ) : toast.cancel && isAction(toast.cancel) ? (
            <button
              data-button
              data-cancel
              style={toast.cancelButtonStyle ?? cancelButtonStyle}
              onClick$={(event, target) => {
                // We need to check twice because typescript
                if (!isAction(toast.cancel)) return;
                if (!dismissible) return;
                deleteToast();
                if (toast.cancel.onClick$) toast.cancel.onClick$(event, target);
              }}
              class={[classes?.cancelButton, toast?.classes?.cancelButton]}
            >
              {toast.cancel.label}
            </button>
          ) : null}
          {typeof toast.action === "function" ? (
            toast.action
          ) : toast.action && isAction(toast.action) ? (
            <button
              data-button=""
              style={toast.actionButtonStyle || actionButtonStyle}
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
          ) : null}
        </>
      )}
    </li>
  );
});
