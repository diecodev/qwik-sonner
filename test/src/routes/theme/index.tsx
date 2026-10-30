import { component$, useSignal } from "@qwik.dev/core";
import { useLocation } from "@qwik.dev/router";
import { toast, Toaster, type Theme } from "qwik-sonner";

export default component$(() => {
  const params = useLocation().url.searchParams;
  const theme = useSignal<Theme>((params.get("theme") as Theme | null) ?? "system");
  const show = useSignal(true);

  return (
    <>
      <button data-testid="theme-light" class="button" onClick$={() => (theme.value = "light")}>
        Light
      </button>
      <button data-testid="theme-dark" class="button" onClick$={() => (theme.value = "dark")}>
        Dark
      </button>
      <button data-testid="theme-system" class="button" onClick$={() => (theme.value = "system")}>
        System
      </button>
      <button
        data-testid="fire-toast"
        class="button"
        onClick$={() => toast("Theme toast", { duration: Infinity })}
      >
        Fire Toast
      </button>
      <button
        data-testid="toggle-toaster"
        class="button"
        onClick$={() => (show.value = !show.value)}
      >
        Toggle Toaster
      </button>
      {show.value && <Toaster theme={theme} />}
    </>
  );
});
