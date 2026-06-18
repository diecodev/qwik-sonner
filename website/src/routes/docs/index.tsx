import { $, component$, useSignal } from "@qwik.dev/core";
import type { DocumentHead } from "@qwik.dev/router";
import { Toaster, toast } from "qwik-sonner";
import { CodeBlock } from "../../components/CodeBlock";
import styles from "./docs.module.css";

type Pos =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export default component$(() => {
  // Live controls wired into the single Toaster rendered at the bottom so the
  // demo buttons actually reflect what each snippet documents.
  const position = useSignal<Pos>("bottom-right");
  const theme = useSignal<"light" | "dark" | "system">("light");
  const richColors = useSignal(false);
  const closeButton = useSignal(false);
  const expand = useSignal(false);

  return (
    <div class="wrapper light">
      <div class={styles.layout}>
        <aside class={styles.sidebar}>
          <nav>
            <span class={styles.group}>Getting started</span>
            <a href="#introduction">Introduction</a>
            <a href="#installation">Installation</a>
            <a href="#quick-start">Quick start</a>
            <a href="#entry-points">Styled vs headless</a>

            <span class={styles.group}>Toasts</span>
            <a href="#types">Toast types</a>
            <a href="#actions">Action & cancel</a>
            <a href="#promise">Promise</a>
            <a href="#custom">Custom / headless</a>
            <a href="#updating">Updating & dismissing</a>
            <a href="#toast-options">Toast options</a>

            <span class={styles.group}>Toaster</span>
            <a href="#toaster-props">Props reference</a>
            <a href="#position">Position</a>
            <a href="#theme">Theme & rich colors</a>
            <a href="#expand">Expand & close button</a>
            <a href="#styling">Styling</a>
            <a href="#top-layer">Top layer</a>

            <span class={styles.group}>Advanced</span>
            <a href="#use-sonner">useSonner</a>
            <a href="#accessibility">Accessibility</a>
          </nav>
        </aside>

        <main class={styles.main}>
          <nav class={styles.topnav}>
            <a href="/">← Home</a>
            <a href="https://github.com/diecodev/qwik-sonner" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://www.npmjs.com/package/qwik-sonner" target="_blank" rel="noreferrer">
              npm
            </a>
          </nav>

          <h1 class={styles.title}>qwik-sonner</h1>
          <p class={styles.lead}>An opinionated toast component for Qwik.</p>
          <p class={styles.lead} style={{ fontSize: "15px" }}>
            A port of <a href="https://sonner.emilkowal.ski/">sonner</a> (React) to Qwik v2. Render
            one <code>&lt;Toaster /&gt;</code> near the root of your app and call{" "}
            <code>toast()</code> from anywhere — server-rendered, resumable, zero hydration.
          </p>

          {/* Introduction ------------------------------------------------ */}
          <section id="introduction" class={styles.section}>
            <h2>Introduction</h2>
            <p>
              qwik-sonner ships two entry points so you can either use the batteries-included styled
              component or bring your own CSS:
            </p>
            <ul>
              <li>
                <strong>Styled</strong> (default):{" "}
                <code>import &#123; Toaster, toast &#125; from "qwik-sonner"</code>
              </li>
              <li>
                <strong>Headless</strong>:{" "}
                <code>import &#123; Toaster, toast &#125; from "qwik-sonner/headless"</code>
              </li>
            </ul>
            <p>
              The API mirrors sonner as closely as Qwik's resumability model allows. The main
              difference: callbacks that cross the serialization boundary (action handlers, promise
              resolvers) must be wrapped in <code>$(...)</code> and use the <code>$</code> suffix
              (e.g. <code>onClick$</code>).
            </p>
          </section>

          {/* Installation ------------------------------------------------ */}
          <section id="installation" class={styles.section}>
            <h2>Installation</h2>
            <CodeBlock
              code={`# npm
npm install qwik-sonner

# pnpm
pnpm add qwik-sonner

# yarn
yarn add qwik-sonner

# bun
bun add qwik-sonner`}
            />
            <div class={styles.note}>
              <strong>Requires Qwik v2</strong> (<code>@qwik.dev/core</code>). qwik-sonner targets
              the Qwik 2.0 beta and does not support the Qwik 1.x (<code>@builder.io/qwik</code>)
              packages.
            </div>
          </section>

          {/* Quick start ------------------------------------------------- */}
          <section id="quick-start" class={styles.section}>
            <h2>Quick start</h2>
            <p>
              Render the <code>Toaster</code> once near the root of your app (e.g. in{" "}
              <code>root.tsx</code> or your top-level layout), then call <code>toast()</code> from
              any component.
            </p>
            <CodeBlock
              code={`import { component$ } from "@qwik.dev/core";
import { Toaster, toast } from "qwik-sonner";

export default component$(() => {
  return (
    <div>
      <button onClick$={() => toast("My first toast")}>
        Give me a toast
      </button>
      <Toaster />
    </div>
  );
});`}
            />
            <div class="buttons">
              <button class="button" onClick$={() => toast("My first toast")}>
                Give me a toast
              </button>
            </div>
          </section>

          {/* Entry points ------------------------------------------------ */}
          <section id="entry-points" class={styles.section}>
            <h2>Styled vs headless</h2>
            <p>
              The default export is fully styled. If you want to ship your own design, import from{" "}
              <code>qwik-sonner/headless</code> — same <code>toast</code> API, an unstyled{" "}
              <code>Toaster</code> wrapper. Use <code>toast.custom</code> (see below) to render
              arbitrary JSX.
            </p>
            <CodeBlock
              code={`// Styled (default)
import { Toaster, toast } from "qwik-sonner";

// Headless — you provide the markup & styles
import { Toaster, toast } from "qwik-sonner/headless";`}
            />
          </section>

          {/* Toast types ------------------------------------------------- */}
          <section id="types" class={styles.section}>
            <h2>Toast types</h2>
            <p>
              The base <code>toast()</code> shows a neutral message. Namespaced helpers render
              themed variants. Every helper accepts an options object as the second argument.
            </p>
            <div class="buttons">
              <button class="button" onClick$={() => toast("Event has been created")}>
                Default
              </button>
              <button
                class="button"
                onClick$={() =>
                  toast("Event has been created", {
                    description: "Monday, January 3rd at 6:00pm",
                  })
                }
              >
                Description
              </button>
              <button class="button" onClick$={() => toast.success("Event has been created")}>
                Success
              </button>
              <button
                class="button"
                onClick$={() => toast.info("Be at the area 10 minutes before the event time")}
              >
                Info
              </button>
              <button
                class="button"
                onClick$={() => toast.warning("Event start time cannot be earlier than 8am")}
              >
                Warning
              </button>
              <button class="button" onClick$={() => toast.error("Event has not been created")}>
                Error
              </button>
              <button class="button" onClick$={() => toast.loading("Creating event…")}>
                Loading
              </button>
            </div>
            <CodeBlock
              code={`toast("Event has been created");

toast("Event has been created", {
  description: "Monday, January 3rd at 6:00pm",
});

toast.success("Event has been created");
toast.info("Be at the area 10 minutes before the event time");
toast.warning("Event start time cannot be earlier than 8am");
toast.error("Event has not been created");
toast.loading("Creating event…");`}
            />
            <p>
              <code>toast.message()</code> is an alias for the default <code>toast()</code> when you
              prefer an explicit name.
            </p>
          </section>

          {/* Action & cancel --------------------------------------------- */}
          <section id="actions" class={styles.section}>
            <h2>Action & cancel buttons</h2>
            <p>
              Add an <code>action</code> button (and optionally a <code>cancel</code> button). The
              handler is a QRL, so wrap it in <code>$(...)</code>. By default the toast dismisses
              after the action runs — set <code>preventDefault: true</code> to keep it open.
            </p>
            <div class="buttons">
              <button
                class="button"
                onClick$={() =>
                  toast("Event has been created", {
                    action: {
                      label: "Undo",
                      onClick$: $(() => toast("Undone!")),
                    },
                  })
                }
              >
                Action
              </button>
              <button
                class="button"
                onClick$={() =>
                  toast("Event has been created", {
                    cancel: {
                      label: "Cancel",
                      onClick$: $(() => console.log("Cancelled")),
                    },
                  })
                }
              >
                Cancel
              </button>
            </div>
            <CodeBlock
              code={`import { $ } from "@qwik.dev/core";

toast("Event has been created", {
  action: {
    label: "Undo",
    onClick$: $(() => toast("Undone!")),
    // preventDefault: true, // keep the toast open after clicking
  },
});

toast("Event has been created", {
  cancel: {
    label: "Cancel",
    onClick$: $(() => console.log("Cancelled")),
  },
});`}
            />
          </section>

          {/* Promise ----------------------------------------------------- */}
          <section id="promise" class={styles.section}>
            <h2>Promise</h2>
            <p>
              <code>toast.promise()</code> renders a loading toast that swaps to success or error
              when the promise settles. <code>success</code> and <code>error</code> may be strings
              or QRLs receiving the resolved/rejected value.
            </p>
            <div class="buttons">
              <button
                class="button"
                onClick$={() =>
                  toast.promise(
                    $(
                      (): Promise<{ name: string }> =>
                        new Promise((resolve) =>
                          setTimeout(() => resolve({ name: "Sonner" }), 2000),
                        ),
                    ),
                    {
                      loading: "Loading…",
                      success: $((data: { name: string }) => `${data.name} toast has been added`),
                      error: "Error",
                    },
                  )
                }
              >
                Run promise
              </button>
            </div>
            <CodeBlock
              code={`import { $ } from "@qwik.dev/core";

const promise = $(
  () => new Promise((resolve) => setTimeout(() => resolve({ name: "Sonner" }), 2000)),
);

toast.promise(promise, {
  loading: "Loading…",
  success: $((data) => \`\${data.name} toast has been added\`),
  error: "Error",
  // finally: $(() => console.log("settled")),
});`}
            />
            <div class={styles.note}>
              The promise can be a <code>Promise</code> or a function/QRL returning one. If it
              resolves to a <code>Response</code> with <code>ok: false</code> or to an{" "}
              <code>Error</code>, the error toast is shown automatically.
            </div>
          </section>

          {/* Custom ------------------------------------------------------ */}
          <section id="custom" class={styles.section}>
            <h2>Custom / headless toasts</h2>
            <p>
              <code>toast.custom()</code> renders arbitrary JSX. The callback receives the toast id
              so you can dismiss it from inside.
            </p>
            <p>
              Pass <code>unstyled: true</code> to drop the default toast box and render a fully
              bespoke card — here, a gradient "Pro unlocked" notification with its own icon and
              actions.
            </p>
            <div class="buttons">
              <button
                class="button"
                onClick$={() =>
                  toast.custom(
                    (id) => (
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          width: "100%",
                          padding: "16px",
                          borderRadius: "12px",
                          color: "#fff",
                          background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                          boxShadow: "0 10px 30px -10px rgba(79, 70, 229, 0.6)",
                        }}
                      >
                        <div
                          style={{
                            flex: "0 0 auto",
                            width: "40px",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                            borderRadius: "50%",
                            background: "rgba(255, 255, 255, 0.15)",
                          }}
                        >
                          ✨
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <strong style={{ fontSize: "14px" }}>You've unlocked Pro</strong>
                          <span style={{ fontSize: "13px", opacity: 0.85, lineHeight: 1.4 }}>
                            Unlimited toasts, custom themes and priority support are now enabled.
                          </span>
                          <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                            <button
                              onClick$={() => toast.dismiss(id)}
                              style={{
                                padding: "5px 12px",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#4f46e5",
                                background: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              Explore
                            </button>
                            <button
                              onClick$={() => toast.dismiss(id)}
                              style={{
                                padding: "5px 12px",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#fff",
                                background: "transparent",
                                border: "1px solid rgba(255, 255, 255, 0.4)",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    ),
                    { unstyled: true, duration: Number.POSITIVE_INFINITY },
                  )
                }
              >
                Custom toast
              </button>
            </div>
            <CodeBlock
              code={`toast.custom(
  (id) => (
    <div
      style={{
        display: "flex",
        gap: "12px",
        width: "100%",
        padding: "16px",
        borderRadius: "12px",
        color: "#fff",
        background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
        boxShadow: "0 10px 30px -10px rgba(79, 70, 229, 0.6)",
      }}
    >
      <div class="icon">✨</div>
      <div>
        <strong>You've unlocked Pro</strong>
        <span>Unlimited toasts, custom themes and priority support.</span>
        <div>
          <button onClick$={() => toast.dismiss(id)}>Explore</button>
          <button onClick$={() => toast.dismiss(id)}>Dismiss</button>
        </div>
      </div>
    </div>
  ),
  // unstyled drops the default toast box so your markup is the whole toast
  { unstyled: true, duration: Number.POSITIVE_INFINITY },
);

// You can also pass JSX directly as the first argument of toast():
toast(<div>A custom toast with default styling</div>);`}
            />
          </section>

          {/* Updating & dismissing --------------------------------------- */}
          <section id="updating" class={styles.section}>
            <h2>Updating & dismissing</h2>
            <p>
              Every toast helper returns an <code>id</code>. Call a helper again with the same{" "}
              <code>id</code> to update an existing toast, or <code>toast.dismiss(id)</code> to
              remove it. Calling <code>toast.dismiss()</code> with no argument clears all toasts.
            </p>
            <div class="buttons">
              <button
                class="button"
                onClick$={() => {
                  const id = toast.loading("Loading…");
                  setTimeout(() => toast.success("Done!", { id }), 1500);
                }}
              >
                Update toast
              </button>
              <button class="button" onClick$={() => toast.dismiss()}>
                Dismiss all
              </button>
            </div>
            <CodeBlock
              code={`const id = toast.loading("Loading…");

// later — reuse the same id to update in place
toast.success("Done!", { id });

// dismiss a specific toast
toast.dismiss(id);

// dismiss every toast
toast.dismiss();`}
            />
          </section>

          {/* Toast options ----------------------------------------------- */}
          <section id="toast-options" class={styles.section}>
            <h2>Toast options</h2>
            <p>
              The second argument to any <code>toast</code> helper (<code>ExternalToast</code>)
              accepts:
            </p>
            <table class={styles.table}>
              <thead>
                <tr>
                  <th>Option</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>id</td>
                  <td>
                    <code>number | string</code>
                  </td>
                  <td>Reuse to update an existing toast in place.</td>
                </tr>
                <tr>
                  <td>description</td>
                  <td>
                    <code>string | JSXOutput</code>
                  </td>
                  <td>Secondary line under the title.</td>
                </tr>
                <tr>
                  <td>duration</td>
                  <td>
                    <code>number</code>
                  </td>
                  <td>
                    Auto-close delay in ms. Use <code>Number.POSITIVE_INFINITY</code> to persist.
                    Defaults to 4000.
                  </td>
                </tr>
                <tr>
                  <td>icon</td>
                  <td>
                    <code>JSXOutput</code>
                  </td>
                  <td>Custom icon for this toast.</td>
                </tr>
                <tr>
                  <td>action / cancel</td>
                  <td>
                    <code>Action | JSXOutput</code>
                  </td>
                  <td>
                    Button with <code>label</code> + <code>onClick$</code> QRL.
                  </td>
                </tr>
                <tr>
                  <td>closeButton</td>
                  <td>
                    <code>boolean</code>
                  </td>
                  <td>Force a close button on this toast.</td>
                </tr>
                <tr>
                  <td>dismissible</td>
                  <td>
                    <code>boolean</code>
                  </td>
                  <td>
                    Allow swipe / close. Defaults to <code>true</code>.
                  </td>
                </tr>
                <tr>
                  <td>important</td>
                  <td>
                    <code>boolean</code>
                  </td>
                  <td>
                    Sets <code>aria-live="assertive"</code> for screen readers.
                  </td>
                </tr>
                <tr>
                  <td>position</td>
                  <td>
                    <code>Position</code>
                  </td>
                  <td>Override the Toaster position for this toast.</td>
                </tr>
                <tr>
                  <td>onDismiss$</td>
                  <td>
                    <code>QRL&lt;(t) =&gt; void&gt;</code>
                  </td>
                  <td>Called when the toast is manually dismissed.</td>
                </tr>
                <tr>
                  <td>onAutoClose$</td>
                  <td>
                    <code>QRL&lt;(t) =&gt; void&gt;</code>
                  </td>
                  <td>Called when the toast closes from its timer.</td>
                </tr>
                <tr>
                  <td>invert / richColors</td>
                  <td>
                    <code>boolean</code>
                  </td>
                  <td>Per-toast overrides of the matching Toaster props.</td>
                </tr>
                <tr>
                  <td>style / class</td>
                  <td>
                    <code>CSSProperties / string</code>
                  </td>
                  <td>Inline styles / class on the toast element.</td>
                </tr>
                <tr>
                  <td>classes</td>
                  <td>
                    <code>ToastClassnames</code>
                  </td>
                  <td>Per-part class overrides (toast, title, description, …).</td>
                </tr>
                <tr>
                  <td>unstyled</td>
                  <td>
                    <code>boolean</code>
                  </td>
                  <td>Strip the default styling for this toast.</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Toaster props ----------------------------------------------- */}
          <section id="toaster-props" class={styles.section}>
            <h2>Toaster props reference</h2>
            <table class={styles.table}>
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>position</td>
                  <td>
                    <code>Position | Signal&lt;Position&gt;</code>
                  </td>
                  <td>
                    <code>bottom-right</code>
                  </td>
                  <td>Corner the toasts stack in. Pass a signal to change it at runtime.</td>
                </tr>
                <tr>
                  <td>theme</td>
                  <td>
                    <code>Theme | Signal&lt;Theme&gt;</code>
                  </td>
                  <td>
                    <code>light</code>
                  </td>
                  <td>
                    Color scheme — <code>light</code>, <code>dark</code> or <code>system</code>.
                    Pass a signal to change it at runtime.
                  </td>
                </tr>
                <tr>
                  <td>richColors</td>
                  <td>
                    <code>boolean | Signal&lt;boolean&gt;</code>
                  </td>
                  <td>
                    <code>false</code>
                  </td>
                  <td>
                    Vivid colored backgrounds for success/error/etc. Pass a signal to toggle it at
                    runtime.
                  </td>
                </tr>
                <tr>
                  <td>expand</td>
                  <td>
                    <code>boolean</code>
                  </td>
                  <td>
                    <code>false</code>
                  </td>
                  <td>Expand all toasts instead of stacking them.</td>
                </tr>
                <tr>
                  <td>visibleToasts</td>
                  <td>
                    <code>number</code>
                  </td>
                  <td>
                    <code>3</code>
                  </td>
                  <td>How many toasts are shown at once.</td>
                </tr>
                <tr>
                  <td>closeButton</td>
                  <td>
                    <code>boolean</code>
                  </td>
                  <td>
                    <code>false</code>
                  </td>
                  <td>Show a close button on every toast.</td>
                </tr>
                <tr>
                  <td>duration</td>
                  <td>
                    <code>number</code>
                  </td>
                  <td>
                    <code>4000</code>
                  </td>
                  <td>Default auto-close delay (ms) for all toasts.</td>
                </tr>
                <tr>
                  <td>gap</td>
                  <td>
                    <code>number</code>
                  </td>
                  <td>
                    <code>14</code>
                  </td>
                  <td>Gap between toasts when expanded (px).</td>
                </tr>
                <tr>
                  <td>offset / mobileOffset</td>
                  <td>
                    <code>Offset</code>
                  </td>
                  <td>—</td>
                  <td>Distance from the viewport edges (string, number, or per-side object).</td>
                </tr>
                <tr>
                  <td>dir</td>
                  <td>
                    <code>Direction | Signal&lt;Direction&gt;</code>
                  </td>
                  <td>
                    <code>auto</code>
                  </td>
                  <td>
                    Text direction — <code>ltr</code>, <code>rtl</code> or <code>auto</code>. Pass a
                    signal to change it at runtime.
                  </td>
                </tr>
                <tr>
                  <td>hotkey</td>
                  <td>
                    <code>string[]</code>
                  </td>
                  <td>
                    <code>["altKey", "KeyT"]</code>
                  </td>
                  <td>Keys that move focus to the toast region.</td>
                </tr>
                <tr>
                  <td>invert</td>
                  <td>
                    <code>boolean | Signal&lt;boolean&gt;</code>
                  </td>
                  <td>
                    <code>false</code>
                  </td>
                  <td>Invert toast colors.</td>
                </tr>
                <tr>
                  <td>swipeDirections</td>
                  <td>
                    <code>SwipeDirection[]</code>
                  </td>
                  <td>derived from position</td>
                  <td>Directions a toast can be swiped to dismiss.</td>
                </tr>
                <tr>
                  <td>icons</td>
                  <td>
                    <code>ToastIcons</code>
                  </td>
                  <td>—</td>
                  <td>Replace default success/info/warning/error/loading/close icons.</td>
                </tr>
                <tr>
                  <td>toastOptions</td>
                  <td>
                    <code>ToastOptions</code>
                  </td>
                  <td>—</td>
                  <td>Default options applied to every toast (class, style, duration, …).</td>
                </tr>
                <tr>
                  <td>topLayer</td>
                  <td>
                    <code>boolean</code>
                  </td>
                  <td>
                    <code>false</code>
                  </td>
                  <td>Render above native modals via the Popover API (see below).</td>
                </tr>
                <tr>
                  <td>class / style</td>
                  <td>
                    <code>string / CSSProperties</code>
                  </td>
                  <td>—</td>
                  <td>Applied to the toaster container.</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Position ---------------------------------------------------- */}
          <section id="position" class={styles.section}>
            <h2>Position</h2>
            <p>
              Toasts can be placed in any corner. Pass a plain string to <code>position</code> to
              set it once, or a <code>Signal&lt;Position&gt;</code> to change it reactively at
              runtime — the buttons below update a signal and the toaster follows instantly.
              Swipe-to-dismiss direction adapts to the chosen position.
            </p>
            <div class="buttons">
              {(
                [
                  "top-left",
                  "top-center",
                  "top-right",
                  "bottom-left",
                  "bottom-center",
                  "bottom-right",
                ] as Pos[]
              ).map((pos) => (
                <button
                  key={pos}
                  class="button"
                  data-active={position.value === pos}
                  onClick$={() => {
                    position.value = pos;
                    toast("Event has been created", {
                      description: "Monday, January 3rd at 6:00pm",
                    });
                  }}
                >
                  {pos}
                </button>
              ))}
            </div>
            <CodeBlock
              code={`// Static — set once
<Toaster position="bottom-right" />

// Reactive — pass a signal and update it anywhere
const position = useSignal<Position>("${position.value}");
<Toaster position={position} />;
position.value = "top-center"; // toaster moves live

// You can also override a single toast:
toast("Event has been created", { position: "top-center" });`}
            />
            <div class={styles.note}>
              The <code>Toaster</code> is an SSR-resumed singleton, so a <strong>plain</strong>{" "}
              <code>position</code> string is read only at mount. Pass a{" "}
              <code>Signal&lt;Position&gt;</code> (like <code>invert</code> accepts) when you need
              to move toasts after render, or set <code>position</code> per toast.
            </div>
          </section>

          {/* Theme ------------------------------------------------------- */}
          <section id="theme" class={styles.section}>
            <h2>Theme & rich colors</h2>
            <p>
              Set the color scheme with <code>theme</code> (<code>light</code>, <code>dark</code> or{" "}
              <code>system</code>). Like <code>position</code>, pass a plain string to set it once
              or a <code>Signal&lt;Theme&gt;</code> to switch it reactively — the button below flips
              a signal and the toasts re-theme instantly.
            </p>
            <div class="buttons">
              <button
                class="button"
                data-active={theme.value === "dark"}
                onClick$={() => {
                  theme.value = theme.value === "dark" ? "light" : "dark";
                  toast.success("Event has been created");
                }}
              >
                theme: {theme.value}
              </button>
            </div>
            <CodeBlock
              code={`// Static — set once
<Toaster theme="dark" />

// Reactive — pass a signal and update it anywhere
const theme = useSignal<Theme>("${theme.value}");
<Toaster theme={theme} />;
theme.value = "dark"; // toasts re-theme live`}
            />
            <p>
              Opt into vivid colored backgrounds for success/error/etc. with <code>richColors</code>
              . It applies to each toast as it renders, and the Toaster prop also accepts a{" "}
              <code>Signal&lt;boolean&gt;</code> — toggle it live:
            </p>
            <div class="buttons">
              <button
                class="button"
                data-active={richColors.value}
                onClick$={() => {
                  richColors.value = !richColors.value;
                  toast.success("Event has been created");
                }}
              >
                richColors: {String(richColors.value)}
              </button>
            </div>
            <CodeBlock code={`<Toaster${richColors.value ? " richColors" : ""} />`} />
          </section>

          {/* Expand ------------------------------------------------------ */}
          <section id="expand" class={styles.section}>
            <h2>Expand & close button</h2>
            <p>
              By default toasts stack; set <code>expand</code> to show them all spread out. Enable{" "}
              <code>closeButton</code> to add a dismiss button to every toast.
            </p>
            <div class="buttons">
              <button
                class="button"
                data-active={expand.value}
                onClick$={() => {
                  expand.value = !expand.value;
                  toast("Event has been created", {
                    description: "Monday, January 3rd at 6:00pm",
                  });
                }}
              >
                expand: {String(expand.value)}
              </button>
              <button
                class="button"
                data-active={closeButton.value}
                onClick$={() => {
                  closeButton.value = !closeButton.value;
                  toast("Event has been created", {
                    description: "Monday, January 3rd at 6:00pm",
                  });
                }}
              >
                closeButton: {String(closeButton.value)}
              </button>
            </div>
            <CodeBlock
              code={`<Toaster${expand.value ? " expand" : ""}${closeButton.value ? " closeButton" : ""} visibleToasts={3} />`}
            />
          </section>

          {/* Styling ----------------------------------------------------- */}
          <section id="styling" class={styles.section}>
            <h2>Styling & customization</h2>
            <p>
              Override styles globally via <code>toastOptions</code> on the Toaster, per-toast via
              the options object, or theme everything with CSS variables.
            </p>
            <h3>Per-part classes</h3>
            <CodeBlock
              code={`<Toaster
  toastOptions={{
    classes: {
      toast: "my-toast",
      title: "my-title",
      description: "my-description",
      actionButton: "my-action",
      cancelButton: "my-cancel",
      closeButton: "my-close",
    },
  }}
/>

// or per toast
toast("Saved", { class: "my-toast", descriptionClass: "muted" });`}
            />
            <h3>Custom icons</h3>
            <CodeBlock
              code={`<Toaster
  icons={{
    success: <MyCheck />,
    error: <MyError />,
    loading: <MySpinner />,
  }}
/>`}
            />
            <h3>CSS variables</h3>
            <p>
              Theme tokens are exposed as CSS custom properties on the toast element, e.g.{" "}
              <code>--normal-bg</code>, <code>--normal-text</code>, <code>--normal-border</code>,{" "}
              <code>--success-bg</code>, <code>--error-bg</code>, and so on. Override them in your
              global stylesheet to recolor toasts.
            </p>
            <h3>Unstyled</h3>
            <p>
              Pass <code>unstyled: true</code> (per toast or via <code>toastOptions</code>) to strip
              the default look, or import from <code>qwik-sonner/headless</code> and supply your own
              markup with <code>toast.custom</code>.
            </p>
          </section>

          {/* Top layer --------------------------------------------------- */}
          <section id="top-layer" class={styles.section}>
            <h2>Top layer</h2>
            <p>
              Native modals (<code>&lt;dialog&gt;.showModal()</code>) and fullscreen elements paint
              above any <code>z-index</code>. Set <code>topLayer</code> to promote the toaster into
              the browser's top layer via the Popover API so toasts stay visible above them.
            </p>
            <CodeBlock code={`<Toaster topLayer />`} />
            <div class={styles.note}>
              The styled entry ships the required <code>[popover]</code> reset. Consumers of the
              headless entry must neutralize the default popover box themselves (target{" "}
              <code>[data-sonner-toaster-popover]</code>). Gracefully no-ops where the Popover API
              is unavailable.
            </div>
          </section>

          {/* useSonner --------------------------------------------------- */}
          <section id="use-sonner" class={styles.section}>
            <h2>useSonner</h2>
            <p>
              Subscribe to the list of active toasts reactively — handy for building a custom
              renderer or badge counter. Returns a <code>Signal</code> of the active toasts.
            </p>
            <CodeBlock
              code={`import { component$ } from "@qwik.dev/core";
import { useSonner } from "qwik-sonner";

export const ToastCount = component$(() => {
  const { toasts } = useSonner();
  return <span>{toasts.value.length} active toasts</span>;
});`}
            />
            <p>
              You can also read the raw state imperatively with <code>toast.getToasts()</code>{" "}
              (currently active) and <code>toast.getHistory()</code> (everything created).
            </p>
          </section>

          {/* Accessibility ----------------------------------------------- */}
          <section id="accessibility" class={styles.section}>
            <h2>Accessibility</h2>
            <ul>
              <li>Toasts are announced to screen readers via an ARIA live region.</li>
              <li>
                Mark urgent toasts with <code>important: true</code> to use{" "}
                <code>aria-live="assertive"</code>.
              </li>
              <li>
                Press the hotkey (<code>Alt</code> + <code>T</code> by default, configurable via{" "}
                <code>hotkey</code>) to move focus into the toast region.
              </li>
              <li>The auto-close timer pauses while the page is hidden or the toast is hovered.</li>
            </ul>
          </section>

          <nav class={styles.topnav} style={{ marginTop: "56px" }}>
            <a href="/">← Back to home</a>
            <a href="https://github.com/diecodev/qwik-sonner" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
        </main>
      </div>

      <Toaster
        theme={theme}
        position={position}
        richColors={richColors}
        closeButton={closeButton.value}
        expand={expand.value}
      />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Documentation — qwik-sonner",
  meta: [
    {
      name: "description",
      content:
        "Full documentation for qwik-sonner: installation, toast types, promises, the Toaster props reference, styling, and more.",
    },
  ],
};
