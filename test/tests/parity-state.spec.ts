import { expect, test } from "@playwright/test";

/**
 * Toast-state behaviour sonner 2.0.8 changed since 2.0.7 (the version the v2 port started
 * from), so qwik-sonner stays on par with it.
 */
test.describe("sonner 2.0.8 parity: toast state", () => {
  test("toast.dismiss() marks every toast dismissed, so a Toaster mounted later doesn't show them", async ({
    page,
  }) => {
    await page.goto("/client-toaster/");
    await page.getByTestId("toggle-toaster").click();
    await page.getByTestId("fire-toast").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
    await page.getByTestId("dismiss-all").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);

    const section = page.locator("section[aria-label^='Notifications']");
    await page.getByTestId("toggle-toaster").click();
    await expect(section).toHaveCount(0);
    await page.getByTestId("toggle-toaster").click();
    await expect(section).toHaveCount(1);
    // A replayed toast would auto-close within `toHaveCount`'s retries: check once.
    await page.waitForTimeout(500);
    expect(await page.locator("[data-sonner-toast]").count()).toBe(0);
  });

  test("a toast re-created while its dismissal is pending stays", async ({ page }) => {
    await page.goto("/parity/");
    await page.getByTestId("action-toast").click();
    await expect(page.getByText("Original")).toHaveCount(1);

    await page.getByTestId("dismiss-and-recreate").click();
    await expect(page.getByText("Recreated")).toHaveCount(1);
    await page.waitForTimeout(500);
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
    await expect(page.getByText("Recreated")).toHaveCount(1);
  });

  test("a toast re-created after it was dismissed doesn't inherit the old one's props", async ({
    page,
  }) => {
    await page.goto("/parity/");
    await page.getByTestId("action-toast").click();
    await expect(page.locator("[data-action]")).toHaveCount(1);
    await page.getByTestId("dismiss-same").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);

    await page.getByTestId("recreate").click();
    await expect(page.getByText("Fresh")).toHaveCount(1);
    await expect(page.locator("[data-action]")).toHaveCount(0);
  });

  test("toast(message, { id }) turns a loading toast into a plain one", async ({ page }) => {
    await page.goto("/parity/");
    await page.getByTestId("loading-then-plain").click();
    const toast = page.locator("[data-sonner-toast]");
    await expect(toast).toHaveText("Done");
    await expect(toast).not.toHaveAttribute("data-type", "loading");
  });

  test("toast.custom(jsx, { id }) drops the type of the toast it replaces", async ({ page }) => {
    await page.goto("/parity/");
    await page.getByTestId("loading-then-custom").click();
    await expect(page.getByTestId("custom-replacement")).toHaveCount(1);
    await expect(page.locator("[data-sonner-toast]")).not.toHaveAttribute("data-type", "loading");
  });

  test("the toast history keeps at most 100 toasts", async ({ page }) => {
    await page.goto("/history/");
    await page.getByTestId("overflow-history").click();
    await expect(page.getByTestId("history-length")).toHaveText("100");
  });
});
