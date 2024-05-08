import { component$, useStyles$ } from "@builder.io/qwik";
import { ToasterProps } from "../headless/types";
import styles from "./styles.css?inline";
import { Toaster as RawToaster } from "../headless/toast-wrapper";

export const Toaster = component$<ToasterProps>((props) => {
  useStyles$(styles);

  return <RawToaster {...props} />;
});
