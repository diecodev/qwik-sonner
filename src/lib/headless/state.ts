import { JSXOutput } from "@builder.io/qwik";
import type {
  ExternalToast,
  ToastT,
  PromiseData,
  PromiseT,
  ToastToDismiss,
  ToastTypes,
} from "./types";

let toastsCounter = 1;

const subscribers: Array<(toast: ToastT | ToastToDismiss) => void> = [];
let toasts: Array<ToastT | ToastToDismiss> = [];

// We use arrow functions to maintain the correct `this` reference
const subscribe = (subscriber: (toast: ToastT | ToastToDismiss) => void) => {
  subscribers.push(subscriber);

  return () => {
    const index = subscribers.indexOf(subscriber);
    subscribers.splice(index, 1);
  };
};

const publish = (data: ToastT) => {
  subscribers.forEach((subscriber) => subscriber(data));
};

const addToast = (data: ToastT) => {
  publish(data);
  toasts = [...toasts, data];
};

const create = (
  data: ExternalToast & {
    message?: string | JSXOutput;
    type?: ToastTypes;
    promise?: PromiseT;
    jsx?: JSXOutput;
  }
) => {
  const { message, ...rest } = data;
  const id =
    typeof data?.id === "number" || (data.id && data.id?.length > 0)
      ? data.id
      : toastsCounter++;
  const alreadyExists = toasts.find((toast) => {
    return toast.id === id;
  });
  const dismissible = data.dismissible === undefined ? true : data.dismissible;

  if (alreadyExists) {
    toasts = toasts.map((toast) => {
      if (toast.id === id) {
        publish({ ...toast, ...data, id, title: message });
        return {
          ...toast,
          ...data,
          id,
          dismissible,
          title: message,
        };
      }

      return toast;
    });
  } else {
    addToast({ title: message, ...rest, dismissible, id });
  }

  return id;
};

const dismiss = (id?: number | string) => {
  if (!id) {
    return toasts.forEach((toast) => {
      subscribers.forEach((subscriber) =>
        subscriber({ id: toast.id, dismiss: true })
      );
    });
  }

  subscribers.forEach((subscriber) => subscriber({ id, dismiss: true }));
  return id;
};

const message = (message: string | JSXOutput, data?: ExternalToast) => {
  return create({ ...data, message });
};

const error = (message: string | JSXOutput, data?: ExternalToast) => {
  return create({ ...data, message, type: "error" });
};

const success = (message: string | JSXOutput, data?: ExternalToast) => {
  return create({ ...data, type: "success", message });
};

const info = (message: string | JSXOutput, data?: ExternalToast) => {
  return create({ ...data, type: "info", message });
};

const warning = (message: string | JSXOutput, data?: ExternalToast) => {
  return create({ ...data, type: "warning", message });
};

const loading = (message: string | JSXOutput, data?: ExternalToast) => {
  return create({ ...data, type: "loading", message });
};

const promise = <ToastData>(
  promise: PromiseT<ToastData>,
  data?: PromiseData<ToastData>
) => {
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
      description:
        typeof data.description !== "function" ? data.description : undefined,
    });
  }

  const p = promise instanceof Promise ? promise : promise();

  let shouldDismiss = id !== undefined;

  p.then(async (response) => {
    // TODO: Clean up TS here, response has incorrect type
    // @ts-expect-error
    if (response && typeof response.ok === "boolean" && !response.ok) {
      shouldDismiss = false;
      const message =
        typeof data.error === "function"
          ? await data.error({
              // @ts-expect-error
              error: `HTTP error! status: ${response.status}`,
            })
          : data.error;
      const description =
        typeof data.description === "function"
          ? await data.description(
              // @ts-expect-error
              `HTTP error! status: ${response.status}`
            )
          : data.description;
      create({ id, type: "error", message, description });
    } else if (data.success !== undefined) {
      shouldDismiss = false;
      const message =
        typeof data.success === "function"
          ? await data.success(response)
          : data.success;
      const description =
        typeof data.description === "function"
          ? await data.description(response)
          : data.description;
      create({ id, type: "success", message, description });
    }
  })
    .catch(async (error) => {
      if (data.error !== undefined) {
        shouldDismiss = false;
        const message =
          typeof data.error === "function"
            ? await data.error(error)
            : data.error;
        const description =
          typeof data.description === "function"
            ? await data.description(error)
            : data.description;
        create({ id, type: "error", message, description });
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
};

const custom = (
  jsx: (id: number | string) => JSXOutput,
  data?: ExternalToast
) => {
  const id = data?.id || toastsCounter++;
  create({ jsx: jsx(id), id, ...data });
  return id;
};

export const ToastState = {
  subscribe,
  addToast,
  create,
  dismiss,
  message,
  error,
  success,
  info,
  warning,
  loading,
  promise,
  custom,
};

// bind this to the toast function
const toastFunction = (message: string | JSXOutput, data?: ExternalToast) => {
  const id = data?.id || toastsCounter++;

  ToastState.addToast({
    title: message,
    ...data,
    id,
  });
  return id;
};

const basicToast = toastFunction;

// We use `Object.assign` to maintain the correct types as we would lose them otherwise
export const toast = Object.assign(basicToast, {
  success: ToastState.success,
  info: ToastState.info,
  warning: ToastState.warning,
  error: ToastState.error,
  custom: ToastState.custom,
  message: ToastState.message,
  promise: ToastState.promise,
  dismiss: ToastState.dismiss,
  loading: ToastState.loading,
});
