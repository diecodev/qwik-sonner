import { JSXNode } from "@builder.io/qwik";
import { store } from "./store";
import {
  ExternalToast,
  PromiseData,
  PromiseT,
  ToastT,
  ToastToDismiss,
  ToastTypes,
} from "./types";

let toastsCounter: number = 1;

export function createToastState() {
  const toasts = new store<ToastT | ToastToDismiss>();
  const subscribers = new store<
    (toast: ExternalToast | ToastToDismiss) => void
  >();

  // this subscribe func is to handle the dismiss props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function subscribe(subscriber: (toast: ToastT | ToastToDismiss) => void) {
    subscribers.update((prev) => [...prev, subscriber as any]);

    return () => {
      const index = subscribers.getAll().indexOf(subscriber as any);
      const newSubscribers = subscribers.getAll().splice(index, 1);
      subscribers.update(() => newSubscribers);
    };
  }

  function addToast(data: ToastT) {
    subscribers.getAll().forEach((subscriber) => subscriber(data));
    toasts.update((prev) => [data, ...prev]);
  }

  function create(
    data: ExternalToast & {
      message?: string | JSXNode;
      type?: ToastTypes;
      promise?: PromiseT;
      jsx?: JSXNode;
    }
  ) {
    const { message, ...rest } = data;
    const id =
      typeof data?.id === "number" || (data.id && data.id?.length > 0)
        ? data.id
        : toastsCounter++;
    const dismissible =
      data.dismissible === undefined ? true : data.dismissible;

    const $toasts = toasts.getAll();

    const alreadyExists = $toasts.find((toast) => {
      return toast.id === id;
    });

    if (alreadyExists) {
      toasts.update((prev) =>
        prev.map((toast) => {
          if (toast.id === id) {
            return { ...toast, ...data, id, title: message, dismissible };
          }
          return toast;
        })
      );
    } else {
      addToast({ ...rest, id, title: message, dismissible });
    }

    return id;
  }

  function dismiss(id?: number | string) {
    if (!id) {
      toasts.set([]);
      return;
    }
    toasts.update((prev) => prev.filter((toast) => toast.id !== id));

    return id;
  }

  function message(message: string | JSXNode, data?: ExternalToast) {
    return create({ ...data, message });
  }

  function error(message: string | JSXNode, data?: ExternalToast) {
    return create({ ...data, type: "error", message });
  }

  function success(message: string | JSXNode, data?: ExternalToast) {
    return create({ ...data, type: "success", message });
  }

  function info(message: string | JSXNode, data?: ExternalToast) {
    return create({ ...data, type: "info", message });
  }

  function warning(message: string | JSXNode, data?: ExternalToast) {
    return create({ ...data, type: "warning", message });
  }

  function loading(message: string | JSXNode, data?: ExternalToast) {
    return create({ ...data, type: "loading", message });
  }

  function promise<ToastData>(
    promise: PromiseT<ToastData>,
    data?: PromiseData<ToastData>
  ) {
    if (!data) {
      // Nothing to show
      return;
    }

    let id: string | number | undefined = undefined;
    if (data.loading !== undefined) {
      id = create({
        ...data,
        promise,
        type: "loading",
        message: data.loading,
      });
    }

    const p = promise instanceof Promise ? promise : promise();

    let shouldDismiss = id !== undefined;

    p.then((response) => {
      // TODO: Clean up TS here, response has incorrect type
      // @ts-expect-error
      if (response && typeof response.ok === "boolean" && !response.ok) {
        shouldDismiss = false;
        const message =
          typeof data.error === "function"
            ? // @ts-expect-error: Incorrect response type
              data.error(`HTTP error! status: ${response.status}`)
            : data.error;
        create({ id, type: "error", message });
      } else if (data.success !== undefined) {
        shouldDismiss = false;
        const message =
          typeof data.success === "function"
            ? data.success(response)
            : data.success;
        create({ id, type: "success", message });
      }
    })
      .catch((error) => {
        if (data.error !== undefined) {
          shouldDismiss = false;
          const message =
            typeof data.error === "function" ? data.error(error) : data.error;
          create({ id, type: "error", message });
        }
      })
      .finally(() => {
        if (shouldDismiss) {
          // Toast is still in load state (and will be indefinitely — dismiss it)
          dismiss(id);
          id = undefined;
        }

        data.finally?.();
      });

    return id;
  }

  function custom(jsx: (id: number | string) => JSXNode, data?: ExternalToast) {
    const id = data?.id || toastsCounter++;
    create({ jsx: jsx(id), id, ...data });
    return id;
  }

  return {
    // methods
    create,
    addToast,
    dismiss,
    message,
    error,
    success,
    info,
    warning,
    loading,
    promise,
    custom,
    subscribe,
    // stores
    toasts,
  };
}

export const toastState = createToastState();

// bind this to the toast function
function toastFunction(message: string | JSXNode, data?: ExternalToast) {
  return toastState.create({
    message,
    ...data,
  });
}

const basicToast = toastFunction;

// We use `Object.assign` to maintain the correct types as we would lose them otherwise
export const toast = Object.assign(basicToast, {
  success: toastState.success,
  info: toastState.info,
  warning: toastState.warning,
  error: toastState.error,
  custom: toastState.custom,
  message: toastState.message,
  promise: toastState.promise,
  dismiss: toastState.dismiss,
  loading: toastState.loading,
});
