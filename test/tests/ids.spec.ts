import { expect, test } from "@playwright/test";

/** `0` is a valid toast id, not "no id". */
test.describe("Toast id 0", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ids/");
  });

  test("toast.dismiss(0) dismisses only the toast with id 0", async ({ page }) => {
    await page.getByTestId("zero-toast").click();
    await page.getByTestId("other-toast").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(2);

    await page.getByTestId("dismiss-zero").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
    await expect(page.locator("[data-sonner-toast]")).toHaveText("Other toast");
  });

  test("toast(message, { id: 0 }) updates the toast with id 0", async ({ page }) => {
    await page.getByTestId("zero-toast").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveText("Zero toast");

    await page.getByTestId("zero-toast-update").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
    await expect(page.locator("[data-sonner-toast]")).toHaveText("Zero toast updated");
  });

  test("toast.custom(jsx, { id: 0 }) keeps the id 0", async ({ page }) => {
    await page.getByTestId("custom-zero").click();
    await expect(page.getByTestId("custom-zero-toast")).toHaveText("Custom toast 0");

    await page.getByTestId("dismiss-zero").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
  });
});
