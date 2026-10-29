import { expect, test } from "@playwright/test";

/**
 * A toast published before the `<Toaster>` subscribes to the toast state must
 * still render once it does: the Toaster shows the toasts that are already
 * active when it subscribes.
 */
test.describe("Toasts fired before the Toaster subscribes", () => {
  test("a toast fired on qinit, before the Toaster subscribes, is shown", async ({ page }) => {
    await page.goto("/early-toast/");
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
    await expect(page.getByText("Early toast")).toHaveCount(1);
  });
});
