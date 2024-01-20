/* eslint-disable qwik/valid-lexical-scope */
import { useSignal, useComputed$ } from "@builder.io/qwik";
import { ToastT, ToastToDismiss } from "../utils/types";

export function useToastStore() {
  const toastsArr = useSignal<ToastT[]>([]);
  const deleteToast = useSignal<ToastToDismiss>({ id: "", dismiss: false });
  const counter = useSignal<number>(0);

  console.log("toastsArr update", toastsArr.value);

  /**
   * SUBCRIPTION LOGIC
   * 1. when user fire toast.dismiss() --> delete all the toasts
   * 2. when user fire toast.dismiss(id) --> delete the specific toast
   *
   * SOLUTION ~MAYBE~
   * - track deleteToast signal
   * - if there is a dismiss prop set to true in deleteToast then we can fire the computed function logic
   */
  useComputed$(() => {
    let newToastArr = toastsArr.value;
    const hasToDismiss = deleteToast.value?.dismiss;
    const id = deleteToast.value?.id;

    //  this is to avoid infinite loop when toast.dismiss(id) is fired.
    if (!hasToDismiss) return;

    if (id) {
      newToastArr = toastsArr.value.map((t) => {
        return t.id === id ? { ...t, delete: true } : t;
      });
    } else {
      newToastArr = toastsArr.value.map((t) => {
        return { ...t, delete: true };
      });
    }

    toastsArr.value = newToastArr;
    deleteToast.value = { id: "", dismiss: false };
  });

  return { toastsArr, deleteToast, counter };
}
