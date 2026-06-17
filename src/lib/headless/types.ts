import {
  ClassList,
  CSSProperties,
  JSXOutput,
  QRL,
  Signal,
} from "@qwik.dev/core";

export type ToastTypes =
  | "normal"
  | "action"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "loading"
  | "default";

export type PromiseT<Data = any> = Promise<Data> | (() => Promise<Data>);

/**
 * A node, or a (possibly async) function returning a node. Functions may be
 * plain (invoked during client render) or QRLs (resolved in `toast.promise`).
 */
export type PromiseTResult<Data = any> =
  | string
  | JSXOutput
  | QRL<(data: Data) => JSXOutput | string | Promise<JSXOutput | string>>
  | ((data: Data) => JSXOutput | string | Promise<JSXOutput | string>);

export interface PromiseIExtendedResult extends ExternalToast {
  message: string | JSXOutput;
}

export type PromiseTExtendedResult<Data = any> =
  | PromiseIExtendedResult
  | QRL<
      (data: Data) => PromiseIExtendedResult | Promise<PromiseIExtendedResult>
    >
  | ((data: Data) => PromiseIExtendedResult | Promise<PromiseIExtendedResult>);

export type PromiseExternalToast = Omit<ExternalToast, "description">;

export type PromiseData<ToastData = any> = PromiseExternalToast & {
  loading?: string | JSXOutput;
  success?: PromiseTResult<ToastData> | PromiseTExtendedResult<ToastData>;
  error?: PromiseTResult | PromiseTExtendedResult;
  description?: PromiseTResult;
  finally?: QRL<() => void | Promise<void>> | (() => void | Promise<void>);
};

export interface ToastClassnames {
  toast?: ClassList;
  title?: ClassList;
  description?: ClassList;
  loader?: ClassList;
  closeButton?: ClassList;
  cancelButton?: ClassList;
  actionButton?: ClassList;
  success?: ClassList;
  error?: ClassList;
  info?: ClassList;
  warning?: ClassList;
  loading?: ClassList;
  default?: ClassList;
  content?: ClassList;
  icon?: ClassList;
}

export interface ToastIcons {
  success?: JSXOutput;
  info?: JSXOutput;
  warning?: JSXOutput;
  error?: JSXOutput;
  loading?: JSXOutput;
  close?: JSXOutput;
}

export interface Action {
  label: string | JSXOutput;
  onClick$: QRL<(ev: PointerEvent, target: HTMLButtonElement) => any>;
  actionButtonStyle?: CSSProperties;
  /**
   * Qwik adaptation of sonner's `event.preventDefault()` behaviour: when `true`
   * the toast is not dismissed after the action runs.
   */
  preventDefault?: boolean;
}

export interface ToastT {
  id: number | string;
  toasterId?: string;
  title?: string | JSXOutput | (() => JSXOutput | string);
  type?: ToastTypes;
  icon?: JSXOutput;
  jsx?: JSXOutput;
  richColors?: boolean;
  invert?: boolean;
  closeButton?: boolean;
  dismissible?: boolean;
  description?: string | JSXOutput | (() => JSXOutput | string);
  duration?: number;
  delete?: boolean;
  important?: boolean;
  action?: Action | JSXOutput;
  cancel?: Action | JSXOutput;
  onDismiss$?: QRL<(toast: ToastT) => unknown>;
  onAutoClose$?: QRL<(toast: ToastT) => unknown>;
  promise?: PromiseT;
  cancelButtonStyle?: CSSProperties;
  actionButtonStyle?: CSSProperties;
  style?: CSSProperties;
  unstyled?: boolean;
  class?: string;
  classes?: ToastClassnames;
  descriptionClass?: string;
  position?: Position;
  testId?: string;
}

export function isAction(action: Action | JSXOutput): action is Action {
  return (
    (action as Action).label !== undefined &&
    typeof (action as Action).onClick$ === "function"
  );
}

export type Position =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

export type SwipeDirection = "top" | "right" | "bottom" | "left";

export interface HeightT {
  height: number;
  toastId: number | string;
  position: Position;
}

interface ToastOptions {
  class?: string;
  closeButton?: boolean;
  descriptionClass?: string;
  style?: CSSProperties;
  cancelButtonStyle?: CSSProperties;
  actionButtonStyle?: CSSProperties;
  duration?: number;
  unstyled?: boolean;
  classes?: ToastClassnames;
  closeButtonAriaLabel?: string;
  toasterId?: string;
}

export type Offset =
  | {
      top?: string | number;
      right?: string | number;
      bottom?: string | number;
      left?: string | number;
    }
  | string
  | number;

export interface ToasterProps {
  id?: string;
  invert?: Signal<boolean> | boolean;
  theme?: "light" | "dark" | "system";
  position?: Position;
  hotkey?: string[];
  richColors?: boolean;
  expand?: boolean;
  duration?: number;
  gap?: number;
  visibleToasts?: number;
  closeButton?: boolean;
  toastOptions?: ToastOptions;
  class?: string;
  style?: CSSProperties;
  offset?: Offset;
  mobileOffset?: Offset;
  dir?: "rtl" | "ltr" | "auto";
  swipeDirections?: SwipeDirection[];
  /**
   * @deprecated Please use the `icons` prop instead:
   * ```jsx
   * <Toaster
   *   icons={{ loading: <LoadingIcon /> }}
   * />
   * ```
   */
  loadingIcon?: JSXOutput;
  icons?: ToastIcons;
  customAriaLabel?: string;
  containerAriaLabel?: string;
  /**
   * @deprecated In parity with sonner 2.x the timer always pauses while the
   * page is hidden; this prop is accepted for backwards compatibility but no
   * longer changes behaviour.
   */
  pauseWhenPageIsHidden?: boolean;
}

export interface ToastProps {
  toast: ToastT;
  toasts: ToastT[];
  index: number;
  swipeDirections?: SwipeDirection[];
  expanded: Signal<boolean>;
  invert: Signal<boolean> | boolean;
  heights: Signal<HeightT[]>;
  removeToast: QRL<(toast: ToastT) => void>;
  gap: number;
  position: Position;
  visibleToasts: number;
  expandByDefault: boolean;
  closeButton: boolean;
  interacting: boolean;
  style?: CSSProperties;
  cancelButtonStyle?: CSSProperties;
  actionButtonStyle?: CSSProperties;
  duration?: number;
  class?: string;
  unstyled?: boolean;
  descriptionClass?: string;
  loadingIcon?: JSXOutput;
  classes?: ToastClassnames;
  icons?: ToastIcons;
  closeButtonAriaLabel?: string;
  defaultRichColors?: boolean;
}

export enum SwipeStateTypes {
  SwipedOut = "SwipedOut",
  SwipedBack = "SwipedBack",
  NotSwiped = "NotSwiped",
}

export type Theme = "light" | "dark" | "system";

export interface ToastToDismiss {
  id: number | string;
  dismiss: boolean;
}

export type ExternalToast = Omit<
  ToastT,
  "id" | "type" | "title" | "jsx" | "delete" | "promise"
> & {
  id?: number | string;
  toasterId?: string;
};
