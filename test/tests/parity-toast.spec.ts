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
});
