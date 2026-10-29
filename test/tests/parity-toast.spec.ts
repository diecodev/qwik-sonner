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
});
