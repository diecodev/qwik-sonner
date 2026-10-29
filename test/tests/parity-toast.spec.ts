import { expect, test } from "@playwright/test";

/**
 * Rendering sonner 2.0.8 changed since 2.0.7 (the version the v2 port started
 * from), so qwik-sonner stays on par with it.
 */
test.describe("sonner 2.0.8 parity: toast rendering", () => {
  test("classes.default only applies to toasts without a type", async ({ page }) => {
    await page.goto("/parity/");
    await page.getByTestId("plain-toast").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
    await page.getByTestId("success-toast").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(2);
    await expect(page.locator("[data-sonner-toast]:not([data-type])")).toHaveClass(/default-class/);
    await expect(page.locator("[data-sonner-toast][data-type=success]")).not.toHaveClass(
      /default-class/,
    );
  });

  test("a loading toast shows its custom icon", async ({ page }) => {
    await page.goto("/parity/");
    await page.getByTestId("loading-with-icon").click();
    await expect(page.getByTestId("custom-loading-icon")).toBeVisible();
  });

  test("the built-in icons are hidden from assistive technology", async ({ page }) => {
    await page.goto("/parity/");
    await page.getByTestId("success-toast").click();
    await expect(page.locator("[data-sonner-toast] [data-icon] svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await page.getByTestId("close-button-toast").click();
    await expect(page.locator("[data-close-button] svg")).toHaveAttribute("aria-hidden", "true");
  });

  test("the content takes the room the icon and the buttons leave", async ({ page }) => {
    await page.goto("/parity/");
    await page.getByTestId("plain-toast").click();
    const content = page.locator("[data-sonner-toast] [data-content]");
    await expect(content).toHaveCSS("flex-grow", "1");
    await expect(content).toHaveCSS("min-width", "0px");
  });

  test("a fast flick in a direction the toast can't be swiped doesn't dismiss it", async ({
    page,
  }) => {
    // Bottom-right toasts swipe down or right; this flick goes up.
    await page.goto("/");
    await page.getByTestId("infinity-toast").click();
    const toast = page.locator("[data-sonner-toast]");
    await toast.waitFor({ state: "visible" });
    await page.waitForFunction(() => {
      const el = document.querySelector("[data-sonner-toast]") as HTMLElement | null;
      return !!el && parseFloat(getComputedStyle(el).opacity) > 0.99;
    });
    const box = await toast.boundingBox();
    if (!box) return;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.waitForSelector("[data-sonner-toast][data-swiping=true]");
    await page.mouse.move(x, y - 400, { steps: 2 });
    await page.mouse.up();

    await page.waitForTimeout(500);
    await expect(toast).toHaveCount(1);
    await expect(toast).toHaveAttribute("data-removed", "false");
  });
});
