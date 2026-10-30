import { expect, test } from "@playwright/test";

// On Qwik 2.0.0-beta.37's dev server, a plain toast followed right away by a
// typed one, before the first had rendered, could stall the Toaster for good
// (about one load in three). Qwik 2.0.0-rc.4 fixed it; the suite runs against
// the dev server, where it happened.
test("two toasts fired back to back both render, and so does the next one", async ({ page }) => {
  await page.goto("/parity/");
  await page.getByTestId("plain-toast").click();
  await page.getByTestId("success-toast").click();
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(2);

  await page.getByTestId("close-button-toast").click();
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(3);
});
