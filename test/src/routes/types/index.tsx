import { component$, useSignal } from "@qwik.dev/core";
import {
  toast,
  Toaster,
  type Direction,
  type Offset,
  type Position,
  type PromiseData,
  type SwipeDirection,
  type Theme,
  type ToastIcons,
  type ToastTypes,
} from "qwik-sonner";
import type {
  Direction as HeadlessDirection,
  Offset as HeadlessOffset,
  Position as HeadlessPosition,
  PromiseData as HeadlessPromiseData,
  SwipeDirection as HeadlessSwipeDirection,
  Theme as HeadlessTheme,
  ToastIcons as HeadlessToastIcons,
  ToastTypes as HeadlessToastTypes,
} from "qwik-sonner/headless";

// The headless entry exports the same types (checked by `pnpm build.types`).
export type HeadlessTypes = [
  HeadlessDirection,
  HeadlessOffset,
  HeadlessPosition,
  HeadlessPromiseData,
  HeadlessSwipeDirection,
  HeadlessTheme,
  HeadlessToastIcons,
  HeadlessToastTypes,
];

const offset: Offset = { top: 48 };
const swipeDirections: SwipeDirection[] = ["left", "right"];
const promiseData: PromiseData<string> = { loading: "Saving...", success: "Saved" };

/** Typed signals/values for every Toaster option, as a consumer would write them. */
export default component$(() => {
  const position = useSignal<Position>("bottom-right");
  const theme = useSignal<Theme>("light");
  const dir = useSignal<Direction>("ltr");
  const type = useSignal<ToastTypes>("success");
  const icons: ToastIcons = { success: <span data-testid="typed-success-icon">ok</span> };

  return (
    <>
      <button
        data-testid="apply-typed-options"
        class="button"
        onClick$={() => {
          position.value = "top-center";
          theme.value = "dark";
          dir.value = "rtl";
        }}
      >
        Apply typed options
      </button>
      <button
        data-testid="fire-typed-toast"
        class="button"
        onClick$={() => (type.value === "success" ? toast.success("Typed toast") : toast("Typed"))}
      >
        Fire Toast
      </button>
      <button
        data-testid="fire-typed-promise"
        class="button"
        onClick$={() =>
          toast.promise(new Promise<string>((r) => setTimeout(() => r("ok"), 300)), promiseData)
        }
      >
        Fire Promise Toast
      </button>
      <Toaster
        position={position}
        theme={theme}
        dir={dir}
        icons={icons}
        offset={offset}
        swipeDirections={swipeDirections}
      />
    </>
  );
});
