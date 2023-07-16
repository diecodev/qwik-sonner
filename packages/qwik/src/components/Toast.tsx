import {
  component$,
  $,
  useComputed$,
  useVisibleTask$,
  useStore,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import type { ToastProps } from "../types";
import { GAP, TIME_BEFORE_UNMOUNT, TOAST_LIFETIME } from "../utils";
import { getAsset } from "./assets";

export const Toast = component$<ToastProps>(
  (props) => {
    // Local state
    const state = useStore({
      mounted: false,
      initialHeight: 0,
      removed: false,
      offsetBeforeRemove: 0,
    });

    // Toast component ref
    const toastRef = useSignal<HTMLLIElement>();

    // use computed to calculate the height of the toast faster
    const actualToastIndex = useComputed$(
      () => props.state.heights.findIndex((h) => h.toastId === props.toast.id) || 0
    );

    // use computed to calculate toast lifetime
    const duration = useComputed$(
      () => props.toast?.duration ?? props?.duration ?? TOAST_LIFETIME
    );

    // timers to handle the toast lifetime resume/pause lifecycle
    const toastType = props.toast.type;
    const timeToDeleteToast = useSignal<number>(duration.value);
    const timeToastWasCreated = useSignal<number>(0)
    const timeToastWasClickedOrHovered = useSignal<number>(0);

    // Calculate offset up untill current  toast
    const previousToastHeights = useComputed$(() => {
      return props.state.heights.reduce((prev, curr, reducerIndex) => {
        if (reducerIndex >= actualToastIndex.value) {
          return prev;
        }

        return prev + curr.height;
      }, 0);
    });

    const offset = useComputed$(
      () => actualToastIndex.value * GAP + previousToastHeights.value
    );

    const [y, x] = props.position.split("-");

    // delete toast from Toaster (parent) state and initialize local animation
    const deleteToast = $(() => {
      state.removed = true;
      state.offsetBeforeRemove = offset.value;
      props.state.heights = props.state.heights.filter((h) => h.toastId !== props.toast.id);
      setTimeout(() => {
        props.onDismiss?.(props.toast)
        props.removeToast(props.toast);
      }, TIME_BEFORE_UNMOUNT);
    });

    // handle user interaction with toast or Toaster (parent) pause/resume lifecycle
    useTask$(({ track, cleanup }) => {
      const expanded = track(() => props.state.expanded);
      const interacting = track(() => props.state.interacting);
      track(() => props.expandByDefault);
      track(() => duration.value);
      track(() => state.removed);

      let timeoutId: number;
      cleanup(() => clearTimeout(timeoutId));

      const startTimer = () => {
        timeToastWasCreated.value = Date.now();

        timeoutId = setTimeout(() => {
          deleteToast();
        }, timeToDeleteToast.value);
      };

      const pauseTimer = () => {
        if (timeToastWasClickedOrHovered.value < timeToastWasCreated.value) {
          const timeElapsed = Date.now() - timeToastWasCreated.value;
          timeToDeleteToast.value = timeToDeleteToast.value - timeElapsed;
        }
        timeToastWasClickedOrHovered.value = Date.now();
      };

      expanded || interacting ? pauseTimer() : startTimer();
    });

    // Change mounted state when component is rendered first time on client
    useVisibleTask$(({ track }) => {
      const isMounted = track(() => state.mounted);
      if (!isMounted) {
        state.mounted = true;
        return;
      }
    });

    // get basic toast height (with padding and intrinsic line-height) to update the heights array from Toaster (parent) component
    useTask$(({ track }) => {
      track(() => toastRef.value)
      const mounted = track(() => state.mounted);

      if (!mounted) return;
      const toast = track(() => props.toast);

      const originalHeight = toastRef.value!.style.height;
      toastRef.value!.style.height = "auto";
      const newHeight = toastRef.value!.getBoundingClientRect().height;
      toastRef.value!.style.height = originalHeight;

      state.initialHeight = newHeight;

      props.state.heights = [
        { toastId: toast.id, height: newHeight },
        ...props.state.heights,
      ];
    });

    return (
      <li
        ref={toastRef}
        role="status"
        tabIndex={0}
        aria-atomic="true"
        aria-live="polite"
        class={props.class + " " + (props.toast.class || "")}

        moick-toaster-item
        moick-data-mounted={`${state.mounted}`}
        moick-data-removed={`${state.removed}`}
        moick-data-visible={`${props.index + 1 <= props.visibleToasts}`}
        moick-y-position={y}
        moick-x-position={x}
        moick-data-styled="true"
        moick-data-front={`${props.index === 0}`}
        moick-data-type={toastType}
        moick-data-expanded={`${props.state.expanded || (props.expandByDefault && state.mounted)}`}
        style={{
          "--index": props.index,
          "--toasts-before": props.index,
          "--z-index": props.state.toasts.length - props.index,
          "--offset": `${state.removed ? state.offsetBeforeRemove : offset.value
            }px`,
          "--initial-height": props.expandByDefault
            ? "auto"
            : `${state.initialHeight}px`,
          ...props.style,
          ...props.toast.style,
        }}
      >
        {props.closeButton ? (
          <button
            aria-label="Close toast"
            moick-close-button
            onClick$={() => {
              deleteToast();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        ) : null}
        {toastType ? <div moick-data-icon="">{getAsset(toastType)}</div> : null}
        <div moick-data-content="">
          <div moick-data-title={props.toast.title}>{props.toast.title}</div>
          {props.toast.description ? (
            <div moick-data-description={props.toast.description} class={props.descriptionClassName}>
              {props.toast.description}
            </div>
          ) : null}
        </div>
      </li>
    );
  }
);
