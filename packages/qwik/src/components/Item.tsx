import {
  component$,
  type CSSProperties,
  type ClassList,
  $,
  useComputed$,
  useVisibleTask$,
  useStore,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import type { Toast as ToastT, Position, State } from "../types";
import { GAP, TIME_BEFORE_UNMOUNT, TOAST_LIFETIME } from "../utils";
import { getAsset } from "./assets";

interface ToastProps {
  toast: ToastT;
  index: number;
  state: State;
  removeToast: (toast: ToastT) => void;
  position: Position;
  visibleToasts: number;
  expandByDefault: boolean;
  closeButton: boolean;
  style?: CSSProperties;
  duration?: number;
  class?: ClassList;
  descriptionClassName?: string;
}

export const Toast = component$<ToastProps>(
  ({
    closeButton,
    expandByDefault,
    index,
    position,
    removeToast,
    state,
    toast,
    visibleToasts,
    class: className = "",
    descriptionClassName,
    duration: durationFromToaster,
    style,
  }) => {
    const localState = useStore({
      mounted: false,
      initialHeight: 0,
      removed: false,
      offsetBeforeRemove: 0,
    });
    const ref = useSignal<HTMLLIElement>();

    // use computed to calculate the height of the toast faster
    const heightIndex = useComputed$(
      () => state.heights.findIndex((h) => h.toastId === toast.id) || 0
    );

    const duration = useComputed$(
      () => toast.duration || durationFromToaster || TOAST_LIFETIME
    );
    // timers to handle the toast lifetime resume/pause lifecycle
    const toastType = toast.type;
    const durationTime = useSignal<number>(duration.value);
    const startTime = useSignal<number>(0);
    const actualTime = useSignal<number>(0);

    const toastsHeightBefore = useComputed$(() => {
      return state.heights.reduce((prev, curr, reducerIndex) => {
        // Calculate offset up untill current  toast
        if (reducerIndex >= heightIndex.value) {
          return prev;
        }

        return prev + curr.height;
      }, 0);
    });

    const offset = useComputed$(
      () => heightIndex.value * GAP + toastsHeightBefore.value
    );

    const [y, x] = position.split("-");

    const deleteToast = $(() => {
      localState.removed = true;
      localState.offsetBeforeRemove = offset.value;
      state.heights = state.heights.filter((h) => h.toastId !== toast.id);
      setTimeout(() => {
        removeToast(toast);
      }, TIME_BEFORE_UNMOUNT);
    });

    useTask$(({ track, cleanup }) => {
      const expandedTrack = track(() => state.expanded);
      const interactingTrack = track(() => state.interacting);
      track(() => expandByDefault);
      track(() => toast);
      track(() => duration.value);
      track(() => localState.removed);
      track(() => toastType);

      let timeoutId: number;
      cleanup(() => clearTimeout(timeoutId));

      const startTimer = () => {
        startTime.value = Date.now();

        timeoutId = setTimeout(() => {
          deleteToast();
        }, durationTime.value);
      };

      const pauseTimer = () => {
        if (actualTime.value < startTime.value) {
          const timeElapsed = Date.now() - startTime.value;
          durationTime.value = durationTime.value - timeElapsed;
        }
        actualTime.value = Date.now();
      };

      expandedTrack || interactingTrack ? pauseTimer() : startTimer();
    });

    useVisibleTask$(({ track }) => {
      const isMounted = track(() => localState.mounted);
      if (!isMounted) {
        localState.mounted = true;
        return;
      }
    });

    useTask$(({ track }) => {
      const toastRef = track(() => ref.value);
      const t = track(() => toast);
      if (!toastRef) return;

      const originalHeight = toastRef.style.height;
      toastRef.style.height = "auto";
      const newHeight = toastRef.getBoundingClientRect().height;
      toastRef.style.height = originalHeight;

      localState.initialHeight = newHeight;

      const alreadyExists = state.heights.find((h) => h.toastId === t.id);
      if (!alreadyExists) {
        state.heights = [
          { toastId: t.id, height: newHeight },
          ...state.heights,
        ];
      } else {
        state.heights = state.heights.map((h) =>
          h.toastId === t.id ? { ...h, height: newHeight } : h
        );
      }
    });

    useTask$(({ track, cleanup }) => {
      const id = track(() => toast.id);
      const toastNode = ref.value;
      cleanup(() => {
        state.heights = state.heights.filter((h) => h.toastId !== id);
      });

      if (!toastNode) return;

      const height = toastNode.getBoundingClientRect().height;
      localState.initialHeight = height;
      state.heights = [{ toastId: id, height }, ...state.heights];
    });

    useTask$(({ track }) => {
      track(() => toast.dismiss);
      track(() => deleteToast);

      if (toast.dismiss) {
        deleteToast();
      }
    });

    return (
      <li
        ref={ref}
        aria-live={toast.important ? "assertive" : "polite"}
        aria-atomic="true"
        role="status"
        tabIndex={0}
        class={className + " " + (toast.classList || "")}
        data-moick-toast=""
        data-mounted={localState.mounted}
        data-removed={localState.removed}
        data-visible={index + 1 <= visibleToasts}
        data-y-position={y}
        data-x-position={x}
        data-index={index}
        data-front={index === 0}
        data-type={toastType}
        data-expanded={Boolean(
          state.expanded || (expandByDefault && localState.mounted)
        )}
        style={{
          "--index": index,
          "--toasts-before": index,
          "--z-index": state.toasts.length - index,
          "--offset": `${
            localState.removed ? localState.offsetBeforeRemove : offset.value
          }px`,
          "--initial-height": expandByDefault
            ? "auto"
            : `${localState.initialHeight}px`,
          ...style,
          ...toast.style,
        }}
      >
        {closeButton ? (
          <button
            aria-label="Close toast"
            data-close-button
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
        {toastType ? <div data-icon="">{getAsset(toastType)}</div> : null}
        <div data-content="">
          <div data-title="">{toast.title}</div>
          {toast.description ? (
            <div data-description="" class={descriptionClassName}>
              {toast.description}
            </div>
          ) : null}
        </div>
      </li>
    );
  }
);
