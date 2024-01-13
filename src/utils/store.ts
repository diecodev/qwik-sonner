export class store<T> {
  data: T[];

  constructor() {
    this.data = [];
  }

  // crate a update function that receive a callback to update the store
  update(fn: (data: T[]) => T[]) {
    this.data = fn(this.data);
  }

  set(value: T[]) {
    this.data = value;
  }

  getAll() {
    return this.data;
  }
}
