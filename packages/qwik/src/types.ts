import { CSSProperties, ClassList } from "@builder.io/qwik";

export enum Theme {
  light = "light",
  dark = "dark",
  system = "system",
  default = "light",
};
export enum VisibleToast {
  one = 1,
  two = 2,
  three = 3,
  four = 4,
  five = 5,
  default = 3,
}

export type ToastType = "normal" | "success" | "error";
export type Position =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

export interface ToastOptions {
  class?: ClassList;
  descriptionClassName?: ClassList;
  style?: CSSProperties;
}

export interface HeightT {
  height: number;
  toastId: number | string;
}

export interface ToasterProps {
  theme?: Theme;
  position?: Position;
  hotkey?: string[];
  richColors?: boolean;
  expand?: boolean;
  duration?: number;
  visibleToasts?: VisibleToast;
  closeButton?: boolean;
  toastOptions?: ToastOptions;
  class?: ClassList;
  style?: CSSProperties;
  offset?: string | number;
};


export interface Toast extends BasicOptions {
  title?: string;
  type?: ToastType;
}

export interface BasicOptions {
  id: string;
  dismiss?: boolean;
  description?: string;
  class?: ClassList;
  style?: CSSProperties;
  duration?: number;
  important?: boolean;
}

// state management
export interface State {
  toasts: Toast[];
  expanded: boolean;
  heights: HeightT[];
  interacting: boolean;
  theme: Theme;
}

// Toast component props
export interface ToastProps {
  toast: Toast;
  index: number;
  state: State;
  removeToast: (toast: Toast) => void;
  position: Position;
  visibleToasts: VisibleToast;
  expandByDefault: boolean;
  closeButton: boolean;
  duration?: number;
  class?: ClassList;
  descriptionClassName?: ClassList;
  style?: CSSProperties;
  onDismiss?: (toast: Toast) => void;
}