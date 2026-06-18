import zlib from "node:zlib";
import { expect, test, type Page } from "@playwright/test";

/**
 * Tests for the top-layer (Popover API) support — issue #11.
 *
 * Native `<dialog>.showModal()` promotes the modal to the browser's *top
 * layer*, which paints above every element in the normal DOM tree regardless
 * of `z-index`. A toaster living in the normal tree (the default, in parity
 * with sonner) therefore renders *behind* such a modal.
 *
 * The opt-in `topLayer` prop promotes the toaster container to the top layer
 * via the native Popover API (`popover="manual"` + `showPopover()`), so toasts
 * appear above native modals. With the prop off, behaviour is unchanged.
 */

/**
 * The first pixel of a PNG's first scanline is stored raw regardless of the
 * per-line filter (its left/up neighbours are zero), so we can read it without
 * a full decoder — enough to sample a single screenshot pixel dependency-free.
 */
function firstPixelRGB(png: Buffer): [number, number, number] {
  let idat = Buffer.alloc(0);
  let off = 8; // skip the 8-byte PNG signature
  while (off < png.length) {
    const len = png.readUInt32BE(off);
    const type = png.toString("ascii", off + 4, off + 8);
    if (type === "IDAT") idat = Buffer.concat([idat, png.subarray(off + 8, off + 8 + len)]);
    off += 12 + len; // length + type + data + CRC
  }
  const raw = zlib.inflateSync(idat);
  return [raw[1], raw[2], raw[3]]; // [filterByte, R, G, B, ...]
}

/**
 * Paint-order check: a modal `<dialog>` makes the rest of the document inert,
 * so `elementFromPoint` (hit-testing) is unreliable here. Sample the actual
 * painted pixel at the toast's center instead. The test modal is solid blue;
 * if the toast paints above it the pixel is *not* blue.
 */
async function toastPaintsAboveModal(page: Page): Promise<boolean> {
  const at = await page.evaluate(() => {
    const toast = document.querySelector("[data-sonner-toast]")!;
    const r = toast.getBoundingClientRect();
    // Clamp into the viewport: the toast can sit off-screen mid enter-animation,
    // and an out-of-bounds clip makes `screenshot()` throw.
    const x = Math.min(Math.max(Math.floor(r.x + r.width / 2), 0), window.innerWidth - 1);
    const y = Math.min(Math.max(Math.floor(r.y + r.height / 2), 0), window.innerHeight - 1);
    return { x, y };
  });
  const png = await page.screenshot({ clip: { x: at.x, y: at.y, width: 1, height: 1 } });
  const [r, g, b] = firstPixelRGB(png);
  const isModalBlue = b > 180 && r < 80 && g < 80;
  return !isModalBlue;
}

test.describe("Top layer (Popover API) support", () => {
  test("by default the toaster is not promoted to the top layer (sonner parity)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("default-button").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
    // No popover container is created when the opt-in prop is absent.
    await expect(page.locator("[data-sonner-toaster-popover]")).toHaveCount(0);
  });

  test("with topLayer the toaster container becomes an open popover when a toast shows", async ({
    page,
  }) => {
    await page.goto("/?topLayer=1");
    const container = page.locator("[data-sonner-toaster-popover]");
    await expect(container).toHaveAttribute("popover", "manual");

    await page.getByTestId("default-button").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);

    const open = await container.evaluate((el) => el.matches(":popover-open"));
    expect(open).toBe(true);
  });

  test("with topLayer a toast renders above a native modal dialog", async ({ page }) => {
    await page.goto("/?topLayer=1");
    await page.getByTestId("open-modal").click();
    await expect(page.getByTestId("native-dialog")).toBeVisible();

    // Fire the toast from inside the modal (the modal blocks the page buttons).
    await page.getByTestId("modal-fire-toast").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);

    // Poll: `showPopover()` runs from an async QRL and the toast plays an enter
    // animation, so promotion to the top layer lands a beat after the toast
    // first appears (notably in WebKit).
    await expect.poll(() => toastPaintsAboveModal(page)).toBe(true);
  });

  test("without topLayer a toast renders behind a native modal dialog (issue #11 default)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("open-modal").click();
    await expect(page.getByTestId("native-dialog")).toBeVisible();

    await page.getByTestId("modal-fire-toast").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);

    // The toast is in the DOM but painted behind the top-layer modal: the
    // sampled pixel stays the modal's solid blue.
    await expect.poll(() => toastPaintsAboveModal(page)).toBe(false);
  });

  test("with topLayer the popover closes once every toast is dismissed", async ({ page }) => {
    await page.goto("/?topLayer=1");
    const container = page.locator("[data-sonner-toaster-popover]");

    await page.getByTestId("default-button").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
    expect(await container.evaluate((el) => el.matches(":popover-open"))).toBe(true);

    // The default toast auto-closes; once empty the popover must be hidden.
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
    await expect
      .poll(async () => container.evaluate((el) => el.matches(":popover-open")))
      .toBe(false);
  });

  test("with topLayer the full-viewport popover layer does not block clicks to the page", async ({
    page,
  }) => {
    await page.goto("/?topLayer=1");
    await page.getByTestId("default-button").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);

    // The popover container spans the whole viewport; if it intercepted pointer
    // events this click would time out. It must be a transparent pass-through.
    await page.getByTestId("success").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(2);
  });
});
