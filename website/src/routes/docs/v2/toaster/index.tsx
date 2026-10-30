import { component$, useComputed$ } from "@qwik.dev/core";
import { Link, type DocumentHead } from "@qwik.dev/router";
import { toast } from "qwik-sonner";
import { CodeBlock } from "~/components/CodeBlock";
import { Callout, H2, H3, PropsTable, type PropRow } from "~/components/docs/ui";
import { POSITIONS, useToasterControls, type Theme } from "~/lib/toaster-context";
import styles from "../../pages.module.css";

const THEMES: Theme[] = ["light", "dark", "system"];

const TOASTER_ROWS: PropRow[] = [
  {
    name: "position",
    type: "Position",
    default: '"bottom-right"',
    signal: true,
    description:
      "Where toasts stack: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center` or `bottom-right`. Swipe direction follows it.",
  },
  {
    name: "theme",
    type: '"light" | "dark" | "system"',
    default: '"light"',
    signal: true,
    description: "Color scheme. `system` follows `prefers-color-scheme` and its changes.",
  },
  {
    name: "richColors",
    type: "boolean",
    default: "false",
    signal: true,
    description: "Colored backgrounds for success, info, warning and error toasts.",
  },
  {
    name: "invert",
    type: "boolean",
    default: "false",
    signal: true,
    description: "Dark toasts on a light theme and vice versa.",
  },
  {
    name: "dir",
    type: '"ltr" | "rtl" | "auto"',
    default: '"auto"',
    signal: true,
    description: "Text direction. `auto` reads `<html dir>` (and keeps tracking it).",
  },
  {
    name: "expand",
    type: "boolean",
    default: "false",
    description: "Show every toast expanded instead of stacked; otherwise they expand on hover.",
  },
  {
    name: "visibleToasts",
    type: "number",
    default: "3",
    description: "How many toasts are visible at once; the rest wait behind.",
  },
  {
    name: "closeButton",
    type: "boolean",
    default: "false",
    description: "Adds a close button to every toast.",
  },
  {
    name: "duration",
    type: "number",
    default: "4000",
    description: "Default time in ms before a toast closes on its own.",
  },
  {
    name: "gap",
    type: "number",
    default: "14",
    description: "Space in px between expanded toasts.",
  },
  {
    name: "offset",
    type: "string | number | { top?, right?, bottom?, left? }",
    default: '"24px"',
    description:
      "Distance from the viewport edges. Numbers are pixels; omitted sides keep the default.",
  },
  {
    name: "mobileOffset",
    type: "string | number | { top?, right?, bottom?, left? }",
    default: '"16px"',
    description: "Same as `offset`, below 600px viewport width.",
  },
  {
    name: "swipeDirections",
    type: '("top" | "right" | "bottom" | "left")[]',
    default: "from position",
    description:
      "Directions a toast can be swiped away. Defaults to the vertical edge plus the horizontal side of `position`.",
  },
  {
    name: "toastOptions",
    type: "ToastOptions",
    description: "Defaults for every toast — see below.",
  },
  {
    name: "icons",
    type: "ToastIcons",
    description:
      "Replace the `success`, `info`, `warning`, `error`, `loading` and `close` icons with your own JSX.",
  },
  {
    name: "hotkey",
    type: "string[]",
    default: '["altKey", "KeyT"]',
    description:
      "Keys that expand the toasts and move focus to them. Modifier properties (`altKey`, `metaKey`…) or `KeyboardEvent.code` values.",
  },
  {
    name: "id",
    type: "string",
    description:
      "Names this Toaster. It then only renders toasts created with a matching `toasterId`; unnamed Toasters render toasts without one.",
  },
  {
    name: "topLayer",
    type: "boolean",
    default: "false",
    description:
      "Promote the toaster to the browser top layer (Popover API) so toasts show above `<dialog>` modals and fullscreen elements.",
  },
  {
    name: "containerAriaLabel",
    type: "string",
    default: '"Notifications"',
    description: "Label of the toasts region; the hotkey is appended (e.g. `Notifications alt+T`).",
  },
  {
    name: "customAriaLabel",
    type: "string",
    description: "Replaces the whole region label, hotkey included.",
  },
  {
    name: "class",
    type: "string",
    description: "Class added to each toast list (`<ol data-sonner-toaster>`).",
  },
  {
    name: "style",
    type: "CSSProperties",
    description: "Inline style for each toast list — handy for CSS variables.",
  },
  {
    name: "loadingIcon",
    type: "JSXOutput",
    deprecated: true,
    description: "Use `icons.loading`.",
  },
  {
    name: "pauseWhenPageIsHidden",
    type: "boolean",
    deprecated: true,
    description: "No effect: timers always pause while the page is hidden (sonner 2 behaviour).",
  },
];

const TOAST_OPTIONS_ROWS: PropRow[] = [
  {
    name: "duration",
    type: "number",
    description: "Default duration in ms (wins over `duration`).",
  },
  { name: "closeButton", type: "boolean", description: "Close button on every toast." },
  { name: "class", type: "string", description: "Class for every toast element." },
  { name: "descriptionClass", type: "string", description: "Class for every description." },
  { name: "classes", type: "ToastClassnames", description: "Per-part classes, see Styling." },
  { name: "style", type: "CSSProperties", description: "Inline style for every toast." },
  {
    name: "actionButtonStyle",
    type: "CSSProperties",
    description: "Style for action buttons (a toast's own wins).",
  },
  {
    name: "cancelButtonStyle",
    type: "CSSProperties",
    description: "Style for cancel buttons (a toast's own wins).",
  },
  { name: "unstyled", type: "boolean", description: "Drop the default toast styles." },
  {
    name: "closeButtonAriaLabel",
    type: "string",
    default: '"Close toast"',
    description: "Accessible label of the close button.",
  },
];

const iconsCode = `<Toaster
  icons={{
    success: <CheckIcon />,
    info: <InfoIcon />,
    warning: <WarningIcon />,
    error: <ErrorIcon />,
    loading: <Spinner />,
    close: <XIcon />,
  }}
/>`;

const offsetCode = `<Toaster offset={32} />
<Toaster offset="5vh" />
<Toaster offset={{ bottom: 80, right: 24 }} mobileOffset={{ bottom: 64 }} />`;

const hotkeyCode = `// ⌘ + K on macOS
<Toaster hotkey={["metaKey", "KeyK"]} />`;

const signalCode = `import { component$, useSignal } from "@qwik.dev/core";
import { Toaster, type ToasterProps } from "qwik-sonner";

type Position = Extract<ToasterProps["position"], string>;

export default component$(() => {
  const position = useSignal<Position>("bottom-right");

  return (
    <>
      <Toaster position={position} />
      <button onClick$={() => (position.value = "top-center")}>Move</button>
    </>
  );
});`;

export default component$(() => {
  const c = useToasterControls();

  const snippet = useComputed$(() => {
    const props: string[] = [];
    if (c.position.value !== "bottom-right") props.push(`position="${c.position.value}"`);
    if (c.theme.value !== "light") props.push(`theme="${c.theme.value}"`);
    if (c.richColors.value) props.push("richColors");
    if (c.expand.value) props.push("expand");
    if (c.closeButton.value) props.push("closeButton");
    if (c.invert.value) props.push("invert");
    if (!props.length) return "<Toaster />";
    return props.length < 3
      ? `<Toaster ${props.join(" ")} />`
      : `<Toaster\n${props.map((p) => `  ${p}`).join("\n")}\n/>`;
  });

  const switches = [
    { label: "richColors", signal: c.richColors },
    { label: "expand", signal: c.expand },
    { label: "closeButton", signal: c.closeButton },
    { label: "invert", signal: c.invert },
  ];

  return (
    <>
      <h1>
        <code>{"<Toaster />"}</code>
      </h1>
      <p class="lead">
        Renders the toasts. Add it once, in your root layout; every prop below is optional.
      </p>

      <H2 id="playground">Playground</H2>
      <p>These controls drive the site's own Toaster — the settings stay while you browse.</p>
      <div class={styles.playground}>
        <div class={styles.controls}>
          <div class={styles.controlRow}>
            <span class={styles.controlLabel}>position</span>
            <div class={styles.segmented}>
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  class={styles.segment}
                  aria-pressed={c.position.value === pos}
                  onClick$={() => {
                    c.position.value = pos;
                    toast("Event has been created", {
                      description: "Monday, January 3rd at 6:00pm",
                    });
                  }}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
          <div class={styles.controlRow}>
            <span class={styles.controlLabel}>theme</span>
            <div class={styles.segmented}>
              {THEMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  class={styles.segment}
                  aria-pressed={c.theme.value === t}
                  onClick$={() => {
                    c.theme.value = t;
                    toast.success("Event has been created");
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {switches.map(({ label, signal }) => (
            <div key={label} class={styles.controlRow}>
              <span class={styles.controlLabel}>{label}</span>
              <button
                type="button"
                role="switch"
                class={styles.switch}
                aria-checked={signal.value}
                aria-label={label}
                onClick$={() => {
                  signal.value = !signal.value;
                  toast.success("Event has been created", {
                    description: "Monday, January 3rd at 6:00pm",
                  });
                }}
              />
            </div>
          ))}
          <div class="buttons">
            <button
              class="button"
              onClick$={() => {
                toast("Event has been created", { description: "Monday, January 3rd at 6:00pm" });
                toast.info("Be at the area 10 minutes before the event time");
                toast.error("Event has not been created");
              }}
            >
              Show a stack
            </button>
            <button
              class="button"
              onClick$={() => {
                c.position.value = "bottom-right";
                c.richColors.value = false;
                c.expand.value = false;
                c.closeButton.value = false;
                c.invert.value = false;
              }}
            >
              Reset
            </button>
          </div>
        </div>
        <CodeBlock code={snippet.value} class={styles.playgroundCode} />
      </div>

      <H2 id="props">Props</H2>
      <PropsTable rows={TOASTER_ROWS} />

      <H3 id="signals">Changing props at runtime</H3>
      <p>
        Props marked <strong>Signal</strong> also accept a <code>Signal</code>. The Toaster is
        rendered on the server and resumed, so pass the signal itself — not{" "}
        <code>signal.value</code> — when the value should change after load:
      </p>
      <CodeBlock code={signalCode} />

      <H2 id="toast-options">toastOptions</H2>
      <p>Defaults applied to every toast; a toast's own options win.</p>
      <PropsTable rows={TOAST_OPTIONS_ROWS} firstColumn="Option" />

      <H2 id="icons">Icons</H2>
      <p>
        Any key you leave out keeps the default icon. To change one toast's icon use its{" "}
        <Link href="/docs/v2/options/">
          <code>icon</code> option
        </Link>
        .
      </p>
      <CodeBlock code={iconsCode} />

      <H2 id="offset">Offset</H2>
      <CodeBlock code={offsetCode} />

      <H2 id="keyboard">Keyboard</H2>
      <p>
        <kbd>Alt</kbd> + <kbd>T</kbd> expands the toasts and moves focus to them; <kbd>Esc</kbd>{" "}
        collapses them again.
      </p>
      <CodeBlock code={hotkeyCode} />
      <Callout type="note">
        <p>
          Need toasts in different places at once? Give each Toaster an <code>id</code> — see{" "}
          <Link href="/docs/v2/advanced/#multiple-toasters">multiple toasters</Link>.
        </p>
      </Callout>
    </>
  );
});

export const head: DocumentHead = {
  title: "<Toaster /> — qwik-sonner",
  meta: [
    {
      name: "description",
      content: "Every <Toaster /> prop, with a live playground for position, theme and stacking.",
    },
  ],
  frontmatter: {
    toc: [
      { id: "playground", title: "Playground" },
      { id: "props", title: "Props" },
      { id: "signals", title: "Changing props at runtime", level: 3 },
      { id: "toast-options", title: "toastOptions" },
      { id: "icons", title: "Icons" },
      { id: "offset", title: "Offset" },
      { id: "keyboard", title: "Keyboard" },
    ],
  },
};
