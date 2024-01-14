import { component$, useSignal } from "@builder.io/qwik";
import { Toaster, type ToasterProps } from "qwik-sonner";
import { Hero } from "../components/Hero";
import { Installation } from "../components/Installation";
import { Usage } from "../components/Usage";
import { Types } from "../components/Types";
import { Position } from "../components/Position";
import { ExpandModes } from "../components/ExpandModes";
import { Other } from "../components/Other";
import { Footer } from "../components/Footer";

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
      <main class="container">
        <Hero />
        <div class="content">
          <Installation />
          <Usage />
          <Types />
          <Position position={position} />
          <ExpandModes expand={expand} />
          <Other closeButton={closeButton} richColors={richColors} />
        </div>
      </main>
      <Footer />
    </div>
  );
});
