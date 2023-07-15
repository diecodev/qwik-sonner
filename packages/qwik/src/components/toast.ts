import { Toast, SubscriberOptions } from "../types";
import { Observer, generateId } from "../utils";

export const toastState = new Observer();

const basicToast = (
  title: string,
  options: Partial<SubscriberOptions> = {}
) => {
  const id = options.id ?? generateId();
  const toast: Toast = { ...options, title, id, type: "normal" };
  toastState.addToast(toast);
  return id;
};

export const toast = Object.assign(basicToast, {
  success: toastState.success,
  error: toastState.error,
  dismiss: toastState.removeToast,
});
