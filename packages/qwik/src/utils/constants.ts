import { Theme, ToastOptions, ToasterProps, VisibleToast } from "../types";

const VIEWPORT_OFFSET = "32px";
const TOAST_WIDTH = 360;
const GAP = 14;
const TOAST_LIFETIME = 5000 // 5s default;
const TIME_BEFORE_UNMOUNT = 200 // animation duration;

// Toast component default options
const DEFAULT_TOAST_OPTIONS: ToastOptions = {
  class: '',
  descriptionClassName: '',
  style: {}
}

// Default Wrapper component options
const DEFAULT_WRAPPER_OPTIONS: Required<ToasterProps> = {
  position: "bottom-right",
  hotkey: ["altKey", "KeyT"],
  expand: false,
  closeButton: false,
  class: '',
  offset: VIEWPORT_OFFSET,
  theme: Theme.default,
  richColors: false,
  duration: TOAST_LIFETIME,
  style: {},
  visibleToasts: VisibleToast.default,
  toastOptions: DEFAULT_TOAST_OPTIONS,
}

export {
  VIEWPORT_OFFSET,
  TOAST_WIDTH,
  GAP,
  TOAST_LIFETIME,
  TIME_BEFORE_UNMOUNT,
  DEFAULT_TOAST_OPTIONS,
  DEFAULT_WRAPPER_OPTIONS
};
