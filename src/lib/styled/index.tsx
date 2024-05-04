import { component$, useStyles$ } from "@builder.io/qwik";
import styles from "./styles.css?inline";
import { Toaster as RawToaster } from "../headless";
import {
  GAP,
  TOAST_LIFETIME,
  TOAST_WIDTH,
  VIEWPORT_OFFSET,
  VISIBLE_TOASTS_AMOUNT,
  ToasterProps,
} from "../core";

export const Toaster = component$<ToasterProps>((props) => {
  useStyles$(styles);

  const {
    position = "bottom-right",
    hotkey = ["altKey", "KeyT"],
    theme = "light",
    visibleToasts = VISIBLE_TOASTS_AMOUNT,
    dir,
    containerAriaLabel = "Notifications",
    expand = false,
    toastOptions = {},
    closeButton = false,
    invert = false,
    gap = GAP,
    loadingIcon,
    offset = VIEWPORT_OFFSET,
    richColors = false,
    duration = TOAST_LIFETIME,
    ...restProps
  } = props;

  return (
    <RawToaster
      {...restProps}
      position={position}
      hotkey={hotkey}
      theme={theme}
      visibleToasts={visibleToasts}
      dir={dir}
      containerAriaLabel={containerAriaLabel}
      expand={expand}
      toastOptions={toastOptions}
      closeButton={closeButton}
      invert={invert}
      gap={gap}
      loadingIcon={loadingIcon}
      offset={offset}
      richColors={richColors}
      duration={duration}
      toastWidth={TOAST_WIDTH}
    />
  );
});
