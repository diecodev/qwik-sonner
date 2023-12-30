/* eslint-disable qwik/valid-lexical-scope */
import "./styles.css?inline";
import {
  $,
  Fragment,
  component$,
  useComputed$,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { ToastProps } from "../utils/types";
import {
  GAP,
  SWIPE_THRESHOLD,
  TIME_BEFORE_UNMOUNT,
  TOAST_LIFETIME,
} from "../constants";
import { Loader, getAsset } from "./assets";

type ToastCardState = {
  mounted: boolean;
  removed: boolean;
  swiping: boolean;
  swipeOut: boolean;
  offsetBeforeRemove: number;
  initialHeight: number;
  dragStartTime: Date | null;
};

export const Toast = component$((props: ToastProps) => {
  const state = useStore<ToastCardState>({
    mounted: false,
    removed: false,
    swiping: false,
    swipeOut: false,
    offsetBeforeRemove: 0,
    initialHeight: 0,
    dragStartTime: null,
  });

  const toastRef = useSignal<HTMLLIElement>();

  const isFront = props.index === 0;
  const isVisible = props.index + 1 <= props.visibleToasts;
  const toastType = props.toast.type;
  const dismissible = props.toast.dismissible !== false;
  const toastClassname = props.toast.className;
  const toastDescriptionClassname = props.toast.descriptionClassName;
  const invert = props.toast.invert || props.invert;
  const disabled = toastType === "loading";

  console.log("onclik event: ", props.toast.action?.onClick()); // temporally just for the qwik gh issue

  // Height index is used to calculate the offset as it gets updated before the toast array, which means we can calculate the new layout faster.
  const heightIndex = useComputed$(() => {
    const partialIndex = props.state.heights.findIndex(
      (h) => h.toastId === props.toast.id
    );
    return partialIndex === -1 ? 0 : partialIndex;
  });

  const duration = useComputed$(
    () => props.toast.duration || props.duration || TOAST_LIFETIME
  );

  const closeTimerStartTimeRef = useSignal<number>(0);
  // const closeTimerRemainingTimeRef = useSignal<number>(duration.value);
  const lastCloseTimerStartTimeRef = useSignal<number>(0);
  const pointerStartRef = useSignal<{ x: number; y: number } | null>(null);
  const [y, x] = props.position.split("-");
  const toastsHeightBefore = useComputed$(() => {
    return props.state.heights.reduce((prev, curr, reducerIndex) => {
      // Calculate offset up until current  toast
      if (reducerIndex >= heightIndex.value) {
        return prev;
      }

      return prev + curr.height;
    }, 0);
  });

  const offset = useComputed$(
    () => heightIndex.value * (props.gap ?? GAP) + toastsHeightBefore.value
  );

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const isMounted = track(() => state.mounted);

    if (!isMounted) {
      state.mounted = true;
      return;
    }
  });

  useTask$(({ track }) => {
    track(() => toastRef.value);

    const mounted = track(() => state.mounted);
    if (!mounted) return;

    const originalHeight = toastRef.value!.style.height;
    toastRef.value!.style.height = "auto";
    const newHeight = toastRef.value!.getBoundingClientRect().height;
    toastRef.value!.style.height = originalHeight;

    state.initialHeight = newHeight;

    const alreadyExists = props.state.heights.find(
      (height) => height.toastId === props.toast.id
    );

    if (!alreadyExists) {
      props.state.heights = [
        { toastId: props.toast.id, height: newHeight },
        ...props.state.heights,
      ];
    } else {
      props.state.heights = props.state.heights.map((height) =>
        height.toastId === props.toast.id
          ? { ...height, height: newHeight }
          : height
      );
    }
  });

  const deleteToast = $(() => {
    // Save the offset for the exit swipe animation
    state.removed = true;
    state.offsetBeforeRemove = offset.value;

    props.state.heights = props.state.heights.filter(
      (h) => h.toastId !== props.toast.id
    );

    setTimeout(() => {
      props.removeToast(props.toast);
    }, TIME_BEFORE_UNMOUNT);
  });

  // handle user interaction with toast or Toaster (parent) pause/resume lifecycle
  useTask$(({ track, cleanup }) => {
    track(() => props.toast.promise);
    track(() => props.toast.duration);
    track(() => props.state.expanded);
    track(() => props.state.interacting);
    track(() => props.expandByDefault);
    track(() => toastType);
    let remainingTime = track(() => duration.value);

    if (
      (props.toast.promise && toastType === "loading") ||
      props.toast.duration === Number.POSITIVE_INFINITY
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
      closeTimerStartTimeRef.value = new Date().getTime();

      // Let the toast know it has started
      timeoutId = setTimeout(() => {
        props.toast.onAutoClose?.(props.toast);
        deleteToast();
      }, remainingTime);
    };

    if (props.state.expanded || props.state.interacting) {
      pauseTimer();
    } else {
      startTimer();
    }

    cleanup(() => clearTimeout(timeoutId));
  });

  useTask$(({ track }) => {
    const deleteToastCond = track(() => props.toast.delete);

    if (deleteToastCond) {
      deleteToast();
    }
  });

  const getLoadingIcon = () => {
    if (props.loadingIcon) {
      return (
        <div class="loader" data-visible={toastType === "loading"}>
          {props.loadingIcon}
        </div>
      );
    }
    return <Loader visible={toastType === "loading"} />;
  };

  return (
    <li
      ref={toastRef}
      aria-live={props.toast.important ? "assertive" : "polite"}
      aria-atomic="true"
      role="status"
      tabIndex={0}
      class={[
        props.className,
        toastClassname,
        props.classNames?.toast,
        props.toast?.classNames?.toast,
        // @ts-expect-error types don't match
        props.classNames?.[toastType],
        // @ts-expect-error types don't match
        props.toast?.classNames?.[toastType],
      ]}
      data-sonner-toast=""
      data-styled={`${!(
        props.toast.jsx ||
        props.toast.unstyled ||
        props.unstyled
      )}`}
      data-mounted={`${state.mounted}`}
      data-promise={Boolean(props.toast.promise)}
      data-removed={`${state.removed}`}
      data-visible={`${isVisible}`}
      data-y-position={y}
      data-x-position={x}
      data-index={props.index}
      data-front={`${isFront}`}
      data-swiping={state.swiping}
      data-dismissible={dismissible}
      data-type={toastType}
      data-invert={invert}
      data-swipe-out={state.swipeOut}
      data-expanded={`${Boolean(
        props.state.expanded || (props.expandByDefault && state.mounted)
      )}`}
      style={{
        "--index": props.index,
        "--toasts-before": props.index,
        "--z-index": props.state.toasts.length - props.index,
        "--offset": `${
          state.removed ? state.offsetBeforeRemove : offset.value
        }px`,
        "--initial-height": props.expandByDefault
          ? "auto"
          : `${state.initialHeight}px`,
        ...props.style,
        ...props.toast.style,
      }}
      onPointerDown$={(event, element) => {
        if (disabled || !dismissible) return;
        state.dragStartTime = new Date();
        state.offsetBeforeRemove = offset.value;
        // Ensure we maintain correct pointer capture even when going outside of the toast (e.g. when swiping)
        element.setPointerCapture(event.pointerId);
        if (element.tagName === "BUTTON") return;
        state.swiping = true;
        pointerStartRef.value = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp$={() => {
        if (state.swipeOut || !dismissible) return;

        pointerStartRef.value = null;
        const swipeAmount = Number(
          toastRef.value?.style
            .getPropertyValue("--swipe-amount")
            .replace("px", "") || 0
        );
        const timeTaken = new Date().getTime() - state.dragStartTime!.getTime();
        const velocity = Math.abs(swipeAmount) / timeTaken;

        // Remove only if threshold is met
        if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
          state.offsetBeforeRemove = offset.value;
          props.toast.onDismiss?.(props.toast);
          deleteToast();
          state.swipeOut = true;
          return;
        }

        toastRef.value?.style.setProperty("--swipe-amount", "0px");
        state.swiping = false;
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
      {props.closeButton && !props.toast.jsx ? (
        <button
          aria-label={props.closeButtonAriaLabel}
          data-disabled={`${disabled}`}
          data-close-button
          onClick$={
            disabled || !dismissible
              ? () => {}
              : () => {
                  deleteToast();
                  props.toast.onDismiss?.(props.toast);
                }
          }
          class={[
            props.classNames?.closeButton,
            props.toast?.classNames?.closeButton,
          ]}
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
      {props.toast.jsx || typeof props.toast.title === "function" ? (
        props.toast.jsx || props.toast.title
      ) : (
        <Fragment>
          {toastType || props.toast.icon || props.toast.promise ? (
            <div data-icon="">
              {(props.toast.promise || props.toast.type === "loading") &&
              !props.toast.icon
                ? getLoadingIcon()
                : null}
              {props.toast.icon || getAsset(toastType)}
            </div>
          ) : null}

          <div data-content="">
            <div
              data-title=""
              class={[props.classNames?.title, props.toast?.classNames?.title]}
            >
              {props.toast.title}
            </div>
            {props.toast.description ? (
              <div
                data-description=""
                class={[
                  props.descriptionClassName,
                  toastDescriptionClassname,
                  props.classNames?.description,
                  props.toast?.classNames?.description,
                ]}
              >
                {props.toast.description}
              </div>
            ) : null}
          </div>
          {props.toast.cancel ? (
            <button
              data-button
              data-cancel
              style={props.toast.cancelButtonStyle || props.cancelButtonStyle}
              onClick$={() => {
                if (!dismissible) return;
                deleteToast();
                if (props.toast.cancel?.onClick) {
                  props.toast.cancel.onClick();
                }
              }}
              class={[
                props.classNames?.cancelButton,
                props.toast?.classNames?.cancelButton,
              ]}
            >
              {props.toast.cancel.label}
            </button>
          ) : null}
          {props.toast.action && (
            <button
              data-button=""
              style={props.toast.actionButtonStyle || props.actionButtonStyle}
              onClick$={(ev, el) => {
                console.log("clicked")
                props.toast.action?.onClick(ev, el)
              }} // just for qwik gh issue
              onMouseOver$={() => console.log("over btn")} // just for qwik gh issue
              class={[
                props.classNames?.actionButton,
                props.toast?.classNames?.actionButton,
              ]}
            >
              {props.toast.action.label}
            </button>
          )}
        </Fragment>
      )}
    </li>
  );
});
