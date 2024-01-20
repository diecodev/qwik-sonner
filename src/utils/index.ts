import { ToastT } from "./types";

export const generateNewToastsArr = ({
  currentArr,
  dataToInsert,
  indexToUpdate,
}: {
  currentArr: ToastT[];
  dataToInsert: ToastT;
  indexToUpdate: number;
}) => {
  const backToasts = currentArr.slice(0, indexToUpdate);
  const currentToast = currentArr[indexToUpdate];
  const frontToasts = currentArr.slice(indexToUpdate + 1);

  return [...backToasts, { ...currentToast, ...dataToInsert }, ...frontToasts];
};
