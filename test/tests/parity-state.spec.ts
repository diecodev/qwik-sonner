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
});
