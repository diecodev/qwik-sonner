import { BasicOptions, Toast } from "../types";

export const generateId = () =>
  crypto.getRandomValues(new Uint32Array(1))[0].toString();

export class Observer {
  subscribers: Array<(toast: Toast | BasicOptions) => void>;
  toastArray: Array<Toast>;

  constructor() {
    this.subscribers = [];
    this.toastArray = [];
  }

  subscribe = (sub: (toast: Toast) => void) => {
    this.subscribers.push(sub);

    return () => {
      console.log('executing unsubscribe');
      this.subscribers = this.subscribers.filter((s) => s !== sub);
    };
  };

  notify = (data: BasicOptions) => {
    this.subscribers.forEach((sub) => sub(data));
  };

  addToast = (data: Toast) => {
    this.notify(data);
    this.toastArray = [...this.toastArray, data];
    return data.id;
  };

  removeToast = (id: string) => {
    this.toastArray = this.toastArray.filter((toast) => toast.id !== id);
    this.notify({ id, dismiss: true });
  };

  success = (title: string, options: Partial<BasicOptions> = {}) => {
    const id = options.id ?? generateId();
    const toast: Toast = { ...options, title, id, type: "success" };
    this.addToast(toast);
    return id;
  };

  error = (title: string, options: Partial<BasicOptions> = {}) => {
    const id = options.id ?? generateId();
    const toast: Toast = { ...options, title, id, type: "error" };
    this.addToast(toast);
    return id;
  };
}
