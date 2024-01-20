// /* eslint-disable qwik/valid-lexical-scope */
// import { useToastStore } from "./use-toast-store";
// import {
//   $,
//   JSXNode,
//   createContextId,
//   useContextProvider,
// } from "@builder.io/qwik";
// import { generateNewToastsArr } from "../utils";
// import {
//   ExternalToast,
//   PromiseData,
//   PromiseT,
//   ToastContext,
//   ToastT,
//   ToastTypes,
// } from "../utils/types";

// type TCreateToast = ExternalToast & {
//   message?: string | JSXNode;
//   type?: ToastTypes;
//   promise?: PromiseT;
//   jsx?: JSXNode;
// };

// export function useToast() {
//   const { toastsArr, deleteToast, counter } = useToastStore();

//   const contextId = createContextId<ToastContext>("qwik-sonner");

//   useContextProvider(contextId, {
//     toastsArr,
//     deleteToast,
//     counter,
//   });

//   /**
//    * UPDATE LOGIC
//    * - if there is a new toast, then we can push it to the state
//    * - if the toast already exists, then we update that specific toast
//    */
//   const updateState = $((newToast: ToastT) => {
//     const toastExists = toastsArr.value.findIndex((t) => t.id === newToast.id);

//     if (toastExists !== -1) {
//       toastsArr.value = generateNewToastsArr({
//         currentArr: toastsArr.value,
//         dataToInsert: newToast,
//         indexToUpdate: toastExists,
//       });
//       return;
//     }

//     toastsArr.value = [newToast, ...toastsArr.value];
//     return;
//   });

//   /**
//    * CREATE LOGIC
//    * - receive some data and create a new toast
//    * - if there is no id provided, then we generate a new id
//    * - if there is an id provided, then we use that
//    */
//   const create = $((newToast: TCreateToast) => {
//     const { message, ...rest } = newToast;

//     const id =
//       typeof newToast?.id === "number" ||
//       (newToast.id && newToast.id?.length > 0)
//         ? newToast.id
//         : counter.value++;

//     const dismissible = newToast.dismissible ?? true;

//     updateState({
//       ...rest,
//       id,
//       title: message,
//       dismissible,
//     });

//     return id;
//   });

//   /**
//    * DISMISS LOGIC
//    * - if id is not provided, then it dismisses all the toasts
//    * - if id is provided, then it dismisses the specific toast
//    */
//   const dismiss = $((id?: number | string) => {
//     deleteToast.value = {
//       dismiss: true,
//       id: id ?? "", // if there is not id provided then set it to an empty string to dismiss all
//     };
//   });

//   /**
//    * THE (MESSAGE/SUCCES/ERROR/INFO/WARNING/LOADING) LOGIC
//    * - receive some data and create a new toast
//    * - ~BUT~ with a custom type just to render a svg icon
//    */
//   const message = $((message: string | JSXNode, data?: ExternalToast) => {
//     return create({ ...data, message });
//   });

//   const error = $((message: string | JSXNode, data?: ExternalToast) => {
//     return create({ ...data, type: "error", message });
//   });

//   const success = $((message: string | JSXNode, data?: ExternalToast) => {
//     return create({ ...data, type: "success", message });
//   });

//   const info = $((message: string | JSXNode, data?: ExternalToast) => {
//     return create({ ...data, type: "info", message });
//   });

//   const warning = $((message: string | JSXNode, data?: ExternalToast) => {
//     return create({ ...data, type: "warning", message });
//   });

//   const loading = $((message: string | JSXNode, data?: ExternalToast) => {
//     return create({ ...data, type: "loading", message });
//   });

//   /**
//    * PROMISE LOGIC
//    * @param promise This is the promise to be executed
//    * @param data this is the configuration object that will handle the promise statuses
//    * @returns
//    */
//   const promise = $((promise: PromiseT, data?: PromiseData) => {
//     if (!data) {
//       // Nothing to show
//       return;
//     }

//     let id: string | number | undefined = undefined;
//     if (data.loading !== undefined) {
//       // @ts-expect-error the create function type is qrl and its promise by default the return type but it isn't
//       id = create({
//         ...data,
//         promise,
//         type: "loading",
//         message: data.loading,
//       });
//     }

//     const p = promise();

//     let shouldDismiss = id !== undefined;

//     p.then(async (response) => {
//       // TODO: Clean up TS here, response has incorrect type
//       if (data.success !== undefined) {
//         shouldDismiss = false;
//         const message =
//           typeof data.success! === "function"
//             ? await data.success(response)
//             : data.success;
//         create({ id, type: "success", message });
//       }
//     })
//       .catch((error) => {
//         if (data.error !== undefined) {
//           shouldDismiss = false;
//           const message =
//             typeof data.error === "function" ? data.error(error) : data.error;
//           create({ id, type: "error", message });
//         }
//       })
//       .finally(() => {
//         if (shouldDismiss) {
//           // Toast is still in load state (and will be indefinitely — dismiss it)
//           dismiss(id);
//           id = undefined;
//         }

//         data.finally?.();
//       });

//     return id;
//   });

//   /**
//    * CUSTOM LOGIC
//    * @param jsx the jsx component to be rendered
//    * @param data the configuration object
//    * @returns the toast id
//    */
//   const custom = $(
//     (jsx: (id: number | string) => JSXNode, data?: ExternalToast) => {
//       const id = data?.id || counter.value++;
//       create({ jsx: jsx(id), id, ...data });
//       return { id };
//     }
//   );

//   return {
//     contextId,
//     basicToast: message,
//     errorToast: error,
//     successToast: success,
//     infoToast: info,
//     warningToast: warning,
//     loadingToast: loading,
//     promiseToast: promise,
//     dismissToast: dismiss,
//     customToast: custom,
//   };
// }
