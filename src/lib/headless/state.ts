import { JSXOutput } from "@qwik.dev/core";
import type {
  ExternalToast,
  PromiseData,
  PromiseIExtendedResult,
  PromiseT,
  ToastT,
  ToastToDismiss,
  ToastTypes,
} from "./types";

let toastsCounter = 1;

type titleT = (() => JSXOutput | string) | JSXOutput | string;

const subscribers: Array<(toast: ToastT | ToastToDismiss) => void> = [];
let toasts: Array<ToastT | ToastToDismiss> = [];
const dismissedToasts = new Set<string | number>();

// `requestAnimationFrame` only exists in the browser; toasts are always
// triggered client-side, but guard anyway so the module is import-safe on SSR.
const scheduleRaf = (cb: () => void) => {
  if (typeof requestAnimationFrame !== "undefined") {
    requestAnimationFrame(cb);
  } else {
    cb();
  }
};

// Qwik does not expose a public `isJSXNode`, so detect a JSX node structurally
// (it carries `type`/`props`/`key`). Used only for the rare case of a promise
// resolving directly to a node.
const isJSXNode = (value: unknown): boolean => {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    "props" in value &&
    "key" in value
  );
};

// Resolve a value that may be a plain value, a sync function, or a QRL.
const resolveMaybe = async (value: unknown, arg: unknown) =>
  typeof value === "function" ? await (value as any)(arg) : value;

const isHttpResponse = (data: any): data is Response => {
  return (
    data &&
    typeof data === "object" &&
    "ok" in data &&
    typeof data.ok === "boolean" &&
    "status" in data &&
    typeof data.status === "number"
  );
};

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
    message?: titleT;
    type?: ToastTypes;
    promise?: PromiseT;
    jsx?: JSXOutput;
  },
) => {
  // NOTE: use native spread + delete instead of `const { message, ...rest }`.
  // The Qwik optimizer rewrites object rest-destructuring into `_restProps()`,
  // which drops the `jsx` property (breaking `toast.custom`).
  const message = data.message;
  const rest = { ...data };
  delete rest.message;
  const id =
    typeof data?.id === "number" || (data.id && data.id?.length > 0) ? data.id : toastsCounter++;
  const alreadyExists = toasts.find((toast) => {
    return toast.id === id;
  });
  const dismissible = data.dismissible === undefined ? true : data.dismissible;

  if (dismissedToasts.has(id)) {
    dismissedToasts.delete(id);
  }

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
  if (id) {
    dismissedToasts.add(id);
    scheduleRaf(() => subscribers.forEach((subscriber) => subscriber({ id, dismiss: true })));
  } else {
    toasts.forEach((toast) => {
      subscribers.forEach((subscriber) => subscriber({ id: toast.id, dismiss: true }));
    });
  }

  return id;
};

const message = (message: titleT, data?: ExternalToast) => {
  return create({ ...data, message });
};

const error = (message: titleT, data?: ExternalToast) => {
  return create({ ...data, message, type: "error" });
};

const success = (message: titleT, data?: ExternalToast) => {
  return create({ ...data, type: "success", message });
};

const info = (message: titleT, data?: ExternalToast) => {
  return create({ ...data, type: "info", message });
};

const warning = (message: titleT, data?: ExternalToast) => {
  return create({ ...data, type: "warning", message });
};

const loading = (message: titleT, data?: ExternalToast) => {
  return create({ ...data, type: "loading", message });
};

const promise = <ToastData>(promise: PromiseT<ToastData>, data?: PromiseData<ToastData>) => {
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
      description: typeof data.description !== "function" ? data.description : undefined,
    });
  }

  const p = Promise.resolve(promise instanceof Function ? promise() : promise);

  let shouldDismiss = id !== undefined;
  let result: ["resolve", ToastData] | ["reject", unknown];

  // An "extended result" is a plain object carrying a `message` plus extra
  // toast options; anything else (string, JSX node) becomes the message itself.
  const buildSettings = (promiseData: unknown): PromiseIExtendedResult => {
    const isExtendedResult =
      typeof promiseData === "object" &&
      promiseData !== null &&
      "message" in promiseData &&
      !isJSXNode(promiseData);

    return isExtendedResult
      ? (promiseData as PromiseIExtendedResult)
      : { message: promiseData as string | JSXOutput };
  };

  const originalPromise = p
    .then(async (response: any) => {
      result = ["resolve", response];
      if (isJSXNode(response)) {
        shouldDismiss = false;
        create({ id, type: "default", message: response });
      } else if (isHttpResponse(response) && !response.ok) {
        shouldDismiss = false;
        const promiseData = await resolveMaybe(
          data.error,
          `HTTP error! status: ${response.status}`,
        );
        const description = await resolveMaybe(
          data.description,
          `HTTP error! status: ${response.status}`,
        );
        create({ id, type: "error", description, ...buildSettings(promiseData) });
      } else if (response instanceof Error) {
        shouldDismiss = false;
        const promiseData = await resolveMaybe(data.error, response);
        const description = await resolveMaybe(data.description, response);
        create({ id, type: "error", description, ...buildSettings(promiseData) });
      } else if (data.success !== undefined) {
        shouldDismiss = false;
        const promiseData = await resolveMaybe(data.success, response);
        const description = await resolveMaybe(data.description, response);
        create({
          id,
          type: "success",
          description,
          ...buildSettings(promiseData),
        });
      }
    })
    .catch(async (error) => {
      result = ["reject", error];
      if (data.error !== undefined) {
        shouldDismiss = false;
        const promiseData = await resolveMaybe(data.error, error);
        const description = await resolveMaybe(data.description, error);
        create({ id, type: "error", description, ...buildSettings(promiseData) });
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

  const unwrap = () =>
    new Promise<ToastData>((resolve, reject) =>
      originalPromise
        .then(() => (result[0] === "reject" ? reject(result[1]) : resolve(result[1])))
        .catch(reject),
    );

  if (typeof id !== "string" && typeof id !== "number") {
    // cannot Object.assign on undefined
    return { unwrap };
  } else {
    return Object.assign(id, { unwrap });
  }
};

const custom = (jsx: (id: number | string) => JSXOutput, data?: ExternalToast) => {
  const id = data?.id || toastsCounter++;
  create({ jsx: jsx(id), ...data, id });
  return id;
};

const getActiveToasts = () => {
  return toasts.filter((toast) => !dismissedToasts.has(toast.id));
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
  getActiveToasts,
  get toasts() {
    return toasts;
  },
};

// bind this to the toast function
const toastFunction = (message: titleT, data?: ExternalToast) => {
  const id = data?.id || toastsCounter++;

  ToastState.addToast({
    title: message,
    ...data,
    id,
  });
  return id;
};

const basicToast = toastFunction;

const getHistory = () => ToastState.toasts;
const getToasts = () => ToastState.getActiveToasts();

// We use `Object.assign` to maintain the correct types as we would lose them otherwise
export const toast = Object.assign(
  basicToast,
  {
    success: ToastState.success,
    info: ToastState.info,
    warning: ToastState.warning,
    error: ToastState.error,
    custom: ToastState.custom,
    message: ToastState.message,
    promise: ToastState.promise,
    dismiss: ToastState.dismiss,
    loading: ToastState.loading,
  },
  { getHistory, getToasts },
);
