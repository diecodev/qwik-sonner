import { component$, useSignal, $ } from "@qwik.dev/core";
import { useLocation, type DocumentHead } from "@qwik.dev/router";
import { toast, Toaster } from "qwik-sonner";

const promise = $(
  () => new Promise((resolve) => setTimeout(() => resolve({ name: "Sonner" }), 2000)),
);

export default component$(() => {
  const params = useLocation().url.searchParams;

  const theme = useSignal<"light" | "dark">((params.get("theme") as any) ?? "light");
  const isFinally = useSignal<boolean>(false);
  const showAutoClose = useSignal<boolean>(false);
  const showDismiss = useSignal<boolean>(false);
  const showAriaLabels = useSignal<boolean>(false);
  const unwrapError = useSignal<string>("");

  const position = (params.get("position") as any) ?? "bottom-right";
  const dir = (params.get("dir") as any) ?? "auto";
  const topLayer = params.get("topLayer") === "1";

  const dialogRef = useSignal<HTMLDialogElement>();

  return (
    <>
      <button
        data-testid="theme-button"
        class="button"
        onClick$={() => {
          console.log("Changing theme");
          theme.value = theme.value === "light" ? "dark" : "light";
          console.log("Theme changed to", theme.value);
        }}
      >
        Change theme
      </button>
      <button data-testid="default-button" class="button" onClick$={() => toast("My Toast")}>
        Render Toast
      </button>
      <button
        data-testid="default-button-top"
        class="button"
        onClick$={() => {
          toast("My Toast", {
            position: "top-right",
          });
        }}
      >
        Render Toast Top
      </button>
      <button
        data-testid="success"
        class="button"
        onClick$={() => toast.success("My Success Toast")}
      >
        Render Success Toast
      </button>
      <button data-testid="error" class="button" onClick$={() => toast.error("My Error Toast")}>
        Render Error Toast
      </button>
      <button
        data-testid="action"
        class="button"
        onClick$={() =>
          toast("My Message", {
            action: {
              label: "Action",
              onClick$: $(() => console.log("Action")),
            },
          })
        }
      >
        Render Action Toast
      </button>
      <button
        data-testid="action-prevent"
        class="button"
        onClick$={() =>
          toast("My Message", {
            action: {
              label: "Action",
              onClick$: $(() => {
                console.log("Action");
              }),
              preventDefault: true,
            },
          })
        }
      >
        Render Action Toast Prevented
      </button>
      <button
        data-testid="promise"
        data-finally={isFinally.value ? "1" : "0"}
        class="button"
        onClick$={() =>
          toast.promise(promise, {
            loading: "Loading...",
            success: "Loaded",
            error: "Error",
            finally: $(() => {
              isFinally.value = true;
            }),
          })
        }
      >
        Render Promise Toast
      </button>
      <button
        data-testid="extended-promise"
        class="button"
        onClick$={() =>
          toast.promise(promise, {
            loading: "Loading...",
            success: $((data: any) => ({
              message: `${data.name} toast has been added`,
              description: "Custom description for the Success state",
            })),
            error: {
              message: "An error occurred",
              action: {
                label: "Retry",
                onClick$: $(() => console.log("retrying")),
              },
            },
            description: "Global description",
          })
        }
      >
        Extended Promise Toast
      </button>
      <button
        data-testid="extended-promise-error"
        class="button"
        onClick$={() =>
          toast.promise(
            new Promise((_, reject) => {
              setTimeout(() => reject(new Error("Simulated error")), 2000);
            }),
            {
              loading: "Loading...",
              success: $((data: any) => ({
                message: `${data.name} toast has been added`,
                description: "Custom description for the Success state",
              })),
              error: {
                message: "An error occurred",
                action: {
                  label: "Retry",
                  onClick$: $(() => console.log("retrying")),
                  preventDefault: true,
                },
              },
              description: "Global description",
            },
          )
        }
      >
        Extended Promise Error Toast
      </button>
      <button
        data-testid="error-promise"
        class="button"
        onClick$={() => {
          const whatWillHappen = $(async () => {
            throw new Error("Not implemented");
          });

          toast.promise(whatWillHappen, {
            loading: "Saving project...",
            success: $((result: any) => (result?.ok ? "Project saved" : `${result?.error}`)),
            error: $((e: any) => `Error Raise: ${e}`),
          });
        }}
      >
        Error Promise Toast
      </button>
      <button
        data-testid="unwrap-reject"
        class="button"
        onClick$={async () => {
          const rejected = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Promise rejected")), 100),
          );
          try {
            await toast.promise(rejected, {})?.unwrap();
          } catch (e) {
            unwrapError.value = (e as Error).message;
          }
        }}
      >
        Unwrap Rejecting Promise
      </button>
      <button
        data-testid="custom"
        class="button"
        onClick$={() =>
          toast.custom((t) => (
            <div>
              <h1>jsx</h1>
              <button data-testid="dismiss-button" onClick$={() => toast.dismiss(t)}>
                Dismiss
              </button>
            </div>
          ))
        }
      >
        Render Custom Toast
      </button>
      <button
        data-testid="custom-with-empty-id"
        class="button"
        onClick$={() =>
          toast.custom(
            (t) => (
              <div>
                <h1>jsx</h1>
                <button data-dismiss onClick$={() => toast.dismiss(t)}>
                  Dismiss
                </button>
              </div>
            ),
            { id: undefined },
          )
        }
      >
        Render Custom Toast with empty id
      </button>
      <button
        data-testid="custom-cancel-button-toast"
        class="button"
        onClick$={() =>
          toast("My Custom Cancel Button", {
            cancel: {
              label: "Cancel",
              onClick$: $(() => console.log("Cancel")),
            },
          })
        }
      >
        Render Custom Cancel Button
      </button>
      <button
        data-testid="infinity-toast"
        class="button"
        onClick$={() => toast("My Toast", { duration: Infinity })}
      >
        Render Infinity Toast
      </button>
      <button
        data-testid="auto-close-toast-callback"
        class="button"
        onClick$={() =>
          toast("My Toast", {
            onAutoClose$: $(() => {
              showAutoClose.value = true;
            }),
          })
        }
      >
        Render Toast With onAutoClose callback
      </button>
      <button
        data-testid="dismiss-toast-callback"
        class="button"
        onClick$={() =>
          toast("My Toast", {
            onDismiss$: $(() => {
              showDismiss.value = true;
            }),
          })
        }
      >
        Dismiss toast callback
      </button>
      <button
        data-testid="non-dismissible-toast"
        class="button"
        onClick$={() =>
          toast("My Toast", {
            dismissible: false,
          })
        }
      >
        Non-dismissible Toast
      </button>
      <button
        data-testid="update-toast"
        class="button"
        onClick$={() => {
          const toastId = toast("My Unupdated Toast", {
            duration: 10000,
          });
          toast("My Updated Toast", {
            id: toastId,
            duration: 10000,
          });
        }}
      >
        Updated Toast
      </button>
      <button
        data-testid="update-toast-duration"
        class="button"
        onClick$={() => {
          const toastId = toast("My Unupdated Toast, Updated After 3 Seconds", {
            duration: 10000,
          });
          setTimeout(() => {
            toast("My Updated Toast, Close After 1 Second", {
              id: toastId,
              duration: 1000,
            });
          }, 3000);
        }}
      >
        Updated Toast Duration
      </button>
      <button
        data-testid="string-description"
        class="button"
        onClick$={() => toast("Custom Description", { description: "string description" })}
      >
        String Description
      </button>
      <button
        data-testid="react-node-description"
        class="button"
        onClick$={() =>
          toast("Custom Description", {
            description: <div>This is my custom ReactNode description</div>,
          })
        }
      >
        ReactNode Description
      </button>
      <button
        class="button"
        onClick$={() => {
          showAriaLabels.value = true;
          toast("Toast with custom ARIA labels", {
            closeButton: true,
            onAutoClose$: $(() => {
              showAriaLabels.value = false;
            }),
          });
        }}
      >
        With custom ARIA labels
      </button>
      <button
        data-testid="toast-secondary"
        class="button"
        onClick$={() => toast("Secondary Toaster Toast", { toasterId: "secondary" })}
      >
        Render Toast in Secondary Toaster
      </button>
      <button
        data-testid="toast-global"
        class="button"
        onClick$={() => toast("Global Toaster Toast")}
      >
        Render Toast in Global Toaster
      </button>
      <button
        data-testid="testid-toast-button"
        class="button"
        onClick$={() => toast("Toast with test ID", { testId: "my-test-toast" })}
      >
        Toast with testId
      </button>
      <button
        data-testid="testid-promise-toast-button"
        class="button"
        onClick$={() =>
          toast.promise(promise, {
            loading: "Loading...",
            success: "Loaded",
            error: "Error",
            testId: "promise-test-toast",
          })
        }
      >
        Promise Toast with testId
      </button>
      <button data-testid="open-modal" class="button" onClick$={() => dialogRef.value?.showModal()}>
        Open Native Modal
      </button>
      <dialog
        data-testid="native-dialog"
        ref={dialogRef}
        style={{
          position: "fixed",
          inset: "0",
          width: "100%",
          height: "100%",
          maxWidth: "none",
          maxHeight: "none",
          margin: "0",
          border: "0",
          // Solid color so e2e can tell, by pixel, whether the toast paints
          // above (issue #11) or behind the modal.
          background: "rgb(0, 0, 255)",
        }}
      >
        <p>Native modal content</p>
        <button data-testid="modal-fire-toast" class="button" onClick$={() => toast("Modal toast")}>
          Fire Toast From Modal
        </button>
        <button data-testid="close-modal" class="button" onClick$={() => dialogRef.value?.close()}>
          Close Modal
        </button>
      </dialog>
      {showAutoClose.value ? <div data-testid="auto-close-el" /> : null}
      {showDismiss.value ? <div data-testid="dismiss-el" /> : null}
      {unwrapError.value ? <div data-testid="unwrap-error">{unwrapError.value}</div> : null}

      <p style={{ maxWidth: 500, marginInline: "auto" }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga a sed incidunt iure sapiente
        id, inventore aspernatur nulla expedita ab optio voluptates exercitationem dolor delectus,
        nobis earum minima perferendis provident dolorem reiciendis vero consequuntur. Nostrum ea
        tempora dolore reprehenderit possimus tenetur eveniet enim incidunt blanditiis odit ut
        suscipit sed qui nulla, rem, maiores accusamus recusandae, quaerat nobis unde ipsa tempore
        magnam. Id laboriosam nam at eligendi. Perspiciatis magnam debitis tempora nesciunt
        temporibus consectetur pariatur nihil nam odio ut ex, vel, quos sapiente mollitia beatae
        accusantium laborum voluptas laboriosam modi. Incidunt porro nulla qui quam, veniam amet
        velit excepturi deserunt ipsa tempora placeat soluta impedit. Consequatur rerum ab quam et
        nisi nobis incidunt sunt accusamus amet minus? Odit eligendi, eius reprehenderit, voluptatem
        amet reiciendis dolore voluptates esse sint explicabo impedit saepe asperiores eos magnam
        iste fugit expedita est facilis dolor eveniet inventore accusantium! Quasi facere
        consequuntur aut cumque alias. Possimus hic, delectus, aliquid quae atque ullam, accusamus
        molestias culpa magnam eligendi explicabo saepe fugit tempora asperiores esse. Sed nam
        facere nulla dolor vitae animi ea ut saepe fugit corrupti ipsam, hic consectetur, autem
        suscipit architecto obcaecati. Sint similique eveniet consectetur. Nisi dolorum enim
        deleniti fugiat facilis aut aspernatur molestiae labore. Et voluptatem eaque ad ipsum neque
        ex suscipit dicta adipisci, eveniet fuga exercitationem repellat, impedit distinctio, ea
        dolor perferendis facere asperiores accusamus nesciunt aspernatur magni quam quod officia
        deserunt! Quibusdam eius alias, porro animi tempore ipsum impedit nobis modi sunt iure
        possimus distinctio laudantium. Corrupti, veniam tenetur. Id aperiam alias libero minus quos
        quis sunt omnis ad. Adipisci repudiandae ab sequi, id totam tempore dignissimos hic minima
        reiciendis amet. Maxime aliquid modi obcaecati sequi iusto! Atque nobis odit, at soluta iste
        eum numquam pariatur eveniet quia exercitationem illo, nostrum minus deleniti porro, earum
        delectus placeat? Est, autem reiciendis aspernatur obcaecati nostrum rem fuga consectetur
        optio. Fuga repudiandae voluptatum quo omnis deleniti nesciunt error vel quos maiores,
        praesentium fugiat porro numquam qui. Amet atque, inventore adipisci quidem rem natus
        possimus. Aliquam pariatur eos similique perferendis inventore, unde corrupti nihil iusto
        quae quisquam, quam, tenetur quidem! Accusantium asperiores error temporibus, saepe enim
        dolorum soluta voluptatibus odit ipsam, possimus magnam ratione quis dignissimos eos qui eum
        facilis debitis. Iure id expedita distinctio nemo assumenda facilis voluptatibus aut eveniet
        repellendus dignissimos veritatis quibusdam velit sed, consectetur repellat? Hic corporis
        reprehenderit explicabo aspernatur ratione repudiandae voluptatibus temporibus minus
        excepturi alias atque rerum cumque velit eos obcaecati voluptas eum, enim expedita
        voluptatem amet iste, necessitatibus cum blanditiis! Perspiciatis laborum eius dolor
        reprehenderit. Autem quis voluptatibus fugiat id laboriosam optio error? Voluptatum eaque
        culpa laborum quibusdam deserunt, non repellendus fuga. Perferendis quis debitis natus
        pariatur porro, laborum magni vero deserunt perspiciatis. Nulla similique iure facilis ullam
        a non maxime? Sunt cum officia, minima molestias suscipit perspiciatis provident perferendis
        reiciendis exercitationem corrupti quia illum illo porro quas numquam consequatur esse!
        Officiis maxime sint aliquam vitae facere nulla, dolorem vel. Aut doloribus dicta quisquam
        sed, modi fuga? Tempora modi, aspernatur sint ad magni inventore maiores repellendus totam
        adipisci quos veritatis laboriosam quas fugit, sapiente non mollitia quod perspiciatis
        nostrum quasi id sequi. Qui omnis totam sunt error officia voluptates, officiis nostrum?
        Nesciunt impedit quod voluptate alias quibusdam consectetur nobis vero animi provident autem
        dolorem ducimus, necessitatibus incidunt natus, quas aliquam, labore eligendi asperiores
        aspernatur ullam earum dolore. Maxime fuga non tempora cum odio deserunt rem? Veniam ab
        doloribus voluptates, impedit facilis aliquam? Corrupti expedita non at accusamus numquam
        aliquam magni aperiam, sed dicta porro dolores veniam libero consectetur cum cupiditate
        atque neque quos. Consequatur quae mollitia laudantium. Reprehenderit voluptas, dolorum ab
        sit reiciendis laborum architecto cumque odit ea doloribus dolores placeat iste sapiente
        aperiam repellat nisi nulla fuga necessitatibus repudiandae nemo est enim nostrum. Ad quidem
        illo corporis consequuntur iusto explicabo placeat minima reprehenderit distinctio atque
        officiis, perferendis reiciendis voluptate dicta sit in necessitatibus. Aliquam sint nemo
        nobis ex expedita architecto, tenetur soluta maiores quam, tempora dolore, praesentium
        eveniet reiciendis mollitia obcaecati voluptas dicta nihil et temporibus iure. Deleniti eos
        doloribus quibusdam quidem! Neque similique aliquam nostrum magnam cum eligendi, magni
        reprehenderit. Pariatur ea eligendi, ipsam ad unde sapiente ratione vero distinctio dolores?
        Sapiente aut dolor, nam quae repellat voluptas! Impedit reiciendis repellat ipsa, enim iure
        officiis minima distinctio atque vel voluptate. Error cupiditate laudantium nam inventore
        quia, id officia magni voluptate ducimus expedita modi obcaecati pariatur iusto in placeat
        animi facere voluptates similique sint harum provident natus rem quam et. Ipsam voluptatem
        ullam, ipsum aliquid dicta maxime ut ad eos perferendis modi placeat hic facilis magni quod
        nobis accusantium quam eum. Est velit adipisci modi, soluta sapiente molestiae tenetur
        magnam molestias laudantium praesentium dolorem quod laboriosam hic? Error sed veniam cum
        totam placeat alias non cumque autem deleniti illum nobis molestiae neque, odit vel.
        Necessitatibus dolores quo voluptatum veniam. Ab, quaerat. Voluptas ullam maxime ad facilis,
        quo obcaecati veniam ea beatae minus placeat necessitatibus reprehenderit dolore sapiente
        libero. Illo sit illum dolore earum nostrum nulla soluta repellat aliquam ipsa, commodi ad
        vel veritatis sint aperiam dignissimos dicta consequuntur perferendis a laudantium
        reiciendis vitae! Aliquam ad quos est dolore doloribus hic inventore, cum odit, esse
        suscipit itaque laudantium voluptatum sequi, minima amet? Rerum pariatur quis, veritatis sit
        voluptatum magni, beatae dignissimos aliquid minus, tempora nostrum natus placeat accusamus!
        Fugiat tempore, vero voluptates fugit perspiciatis sed minus obcaecati corporis suscipit in
        tempora distinctio! Veritatis, neque eum quo ratione nemo ipsa voluptatibus dolores
        recusandae necessitatibus quis. Sunt, sit? Doloribus modi molestiae hic, nemo quo maiores
        porro quaerat nulla facilis cum, repellat, sint quod sapiente dignissimos ipsam ea ad
        exercitationem possimus voluptate temporibus culpa tempore totam minima voluptatibus!
        Facilis, fugiat natus assumenda, exercitationem iure asperiores vitae velit libero
        blanditiis modi nobis earum numquam consequuntur cumque praesentium nemo consectetur
        tenetur. Molestias sequi architecto harum perferendis adipisci quo quaerat? Recusandae
        maiores facilis pariatur rerum nam porro quibusdam error architecto distinctio sit iste
        consequatur impedit laudantium quaerat voluptas quas culpa praesentium vitae, commodi
        obcaecati non perferendis deserunt deleniti animi. Quam, sapiente minima aliquid, repellat,
        quod facilis ab accusantium earum non provident incidunt nisi. Optio, officia cum.
      </p>

      <Toaster
        position={position}
        topLayer={topLayer}
        toastOptions={{
          actionButtonStyle: { backgroundColor: "rgb(219, 239, 255)" },
          cancelButtonStyle: { backgroundColor: "rgb(254, 226, 226)" },
          closeButtonAriaLabel: showAriaLabels.value ? "Yeet the notice" : undefined,
        }}
        theme={theme.value}
        dir={dir}
        // duration={Number.POSITIVE_INFINITY}
        containerAriaLabel={showAriaLabels.value ? "Notices" : undefined}
      />
      <Toaster
        id="secondary"
        position="top-left"
        toastOptions={{ class: "secondary-toaster" }}
        // duration={Number.POSITIVE_INFINITY}
      />
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
