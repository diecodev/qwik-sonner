import { expect, test } from "@playwright/test";

/** With several Toasters, each one's own state ignores the other Toasters' toasts. */
test.describe("Several Toasters", () => {
  test("focus returns once this Toaster empties, while another Toaster shows a toast", async ({
    page,
  }) => {
    await page.goto("/multi-toaster/");
    await page.getByTestId("fire-layer-sticky").click();
    await expect(page.getByText("Sticky top-layer toast")).toHaveCount(1);

    await page.getByTestId("fire-custom").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("custom-dismiss")).toHaveCount(1);
    await page.getByTestId("custom-dismiss").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("custom-dismiss")).toHaveCount(0);

    await expect(page.getByTestId("fire-custom")).toBeFocused();
  });
});
