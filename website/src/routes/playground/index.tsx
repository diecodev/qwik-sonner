import { component$, useSignal, $ } from "@builder.io/qwik";
import { Toaster, type ToasterProps, toast } from "qwik-sonner";

export default component$(() => {
  const expand = useSignal<boolean>(false);
  const position =
    useSignal<Required<Pick<ToasterProps, "position">>["position"]>(
      "bottom-left",
    );
  const richColors = useSignal<boolean>(false);
  const closeButton = useSignal<boolean>(false);

  return (
    <div class="wrapper light">
      <Toaster
        theme="light"
        richColors={richColors.value}
        closeButton={closeButton.value}
        expand={expand.value}
        position={position.value}
      />
      <button
        onClick$={$(() => {
          toast("Load me!");
        })}
      >
        Open Toast
      </button>
    </div>
  );
});
