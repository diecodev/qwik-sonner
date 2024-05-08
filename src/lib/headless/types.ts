import {
  ClassList,
  Component,
  CSSProperties,
  JSXOutput,
  QRL,
  QRLEventHandlerMulti,
  Signal,
} from "@builder.io/qwik";

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

export type PromiseExternalToast = Omit<ExternalToast, "description">;

export type PromiseData<ToastData = any> = PromiseExternalToast & {
  loading?: string;
  success?: string | JSXOutput | QRL<(data: ToastData) => JSXOutput | string>;
  error?: string | QRL<(error: any) => JSXOutput | string> | JSXOutput;
  description?: string | QRL<(data: any) => JSXOutput | string> | JSXOutput;
  finally?: () => void | Promise<void>;
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
  success?: Component;
  info?: Component;
  warning?: Component;
  error?: Component;
  loading?: Component;
}

interface Action {
  label: string;
  onClick$: QRL<(ev: PointerEvent, target: HTMLButtonElement) => any>;
  actionButtonStyle?: CSSProperties;
}

export interface ToastT {
  id: number | string;
  title?: string | JSXOutput;
  type?: ToastTypes;
  icon?: Component;
  jsx?: JSXOutput;
  invert?: boolean;
  closeButton?: boolean;
  dismissible?: boolean;
  description?: JSXOutput | string;
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
}

export interface ToasterProps {
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
  offset?: string | number;
  dir?: "rtl" | "ltr" | "auto";
  /**
   * @deprecated Please use the `icons` prop instead:
   * ```jsx
   * <Toaster
   *   icons={{ loading: <LoadingIcon /> }}
   * />
   * ```
   */
  loadingIcon?: Component;
  icons?: ToastIcons;
  containerAriaLabel?: string;
  pauseWhenPageIsHidden?: boolean;
}

export interface ToastProps {
  toast: ToastT;
  toasts: ToastT[];
  index: number;
  expanded: Signal<boolean>;
  invert: Signal<boolean> | boolean;
  heights: Signal<HeightT[]>;
  removeToast: (toast: ToastT) => void;
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
  loadingIcon?: Component;
  classes?: ToastClassnames;
  icons?: ToastIcons;
  closeButtonAriaLabel?: string;
  pauseWhenPageIsHidden: boolean;
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
};
