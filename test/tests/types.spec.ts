import { expect, test } from "@playwright/test";

/**
 * `/types/` imports `Position`, `Theme`, `Direction`, `SwipeDirection`,
 * `ToastIcons`, `ToastTypes`, `Offset` and `PromiseData` from both entries
 * (`qwik-sonner` and `qwik-sonner/headless`); `pnpm build.types` in `test/`
 * fails if any is not exported. Here we check the typed values reach the Toaster.
 */
test.describe("Public types", () => {
  test("typed signals drive the Toaster", async ({ page }) => {
    await page.goto("/types/");
    await page.getByTestId("apply-typed-options").click();
    await page.getByTestId("fire-typed-toast").click();

    const toaster = page.locator("[data-sonner-toaster]");
    await expect(toaster).toHaveAttribute("data-y-position", "top");
    await expect(toaster).toHaveAttribute("data-x-position", "center");
    await expect(toaster).toHaveAttribute("data-sonner-theme", "dark");
    await expect(toaster).toHaveAttribute("dir", "rtl");
    await expect(page.getByTestId("typed-success-icon")).toHaveCount(1);
  });

  test("typed PromiseData drives a promise toast", async ({ page }) => {
    await page.goto("/types/");
    await page.getByTestId("fire-typed-promise").click();
    await expect(page.getByText("Saving...")).toHaveCount(1);
    await expect(page.getByText("Saved")).toHaveCount(1);
  });
});
