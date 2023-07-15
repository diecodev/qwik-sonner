import { CSSProperties, ClassList } from "@builder.io/qwik";

type Theme = "light" | "dark" | "system";
type ToastType = "normal" | "success" | "error";
type Position =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

interface ToastOptions {
  class?: ClassList;
  descriptionClassName?: string;
  style?: CSSProperties;
}

interface HeightT {
  height: number;
  toastId: number | string;
}

interface ToasterProps {
  theme?: Theme;
  position?: Position;
  hotkey?: string[];
  richColors?: boolean;
  expand?: boolean;
  duration?: number;
  visibleToasts?: number;
  closeButton?: boolean;
  toastOptions?: ToastOptions;
  class?: ClassList;
  style?: CSSProperties;
  offset?: string | number;
}

interface Toast extends SubscriberOptions {
  title?: string;
  type?: ToastType;
}

interface SubscriberOptions {
  id: string;
  dismiss?: boolean;
  description?: string;
  classList?: string | string[];
  style?: CSSProperties;
  duration?: number;
  important?: boolean;
}

// state management
interface State {
  toasts: Toast[];
  expanded: boolean;
  heights: HeightT[];
  interacting: boolean;
  theme: Theme;
}
