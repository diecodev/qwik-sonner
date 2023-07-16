export * from "./constants";
export * from "./observer";

export const createOptionsObject = <T>(objOne: T, objTwo: Partial<T>): T => {
  let obj: Record<string, any> = {}

  Object.keys({ ...objOne, ...objTwo }).map(k => {
    obj[k] = (objTwo as any)[k] ?? (objOne as any)[k]
  })

  const finalObj = Object.freeze(obj) as T

  return finalObj
};