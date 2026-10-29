import { expect, test } from "@playwright/test";

/**
 * `theme="system"` follows the OS color scheme (`prefers-color-scheme`) only
 * while the `theme` prop is `"system"`.
 */
test.describe("System theme", () => {
  test("follows the OS color scheme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/theme/?theme=system");
    await page.getByTestId("fire-toast").click();
    const toaster = page.locator("[data-sonner-toaster]");
    await expect(toaster).toHaveAttribute("data-sonner-theme", "light");

    await page.emulateMedia({ colorScheme: "dark" });
    await expect(toaster).toHaveAttribute("data-sonner-theme", "dark");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(toaster).toHaveAttribute("data-sonner-theme", "light");
  });

  test("stops following the OS once the prop leaves system", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/theme/?theme=system");
    await page.getByTestId("fire-toast").click();
    const toaster = page.locator("[data-sonner-toaster]");
    await expect(toaster).toHaveAttribute("data-sonner-theme", "light");

    // Leave "system" through a visible change, so we know the prop was applied
    // before the OS scheme changes.
    await page.getByTestId("theme-dark").click();
    await expect(toaster).toHaveAttribute("data-sonner-theme", "dark");
    await page.getByTestId("theme-light").click();
    await expect(toaster).toHaveAttribute("data-sonner-theme", "light");

    await page.emulateMedia({ colorScheme: "dark" });
    // Give a stale listener time to (wrongly) flip the theme before asserting.
    await page.waitForTimeout(500);
    await expect(toaster).toHaveAttribute("data-sonner-theme", "light");
  });

  test("starts following the OS when the prop becomes system", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/theme/?theme=light");
    await page.getByTestId("fire-toast").click();
    const toaster = page.locator("[data-sonner-toaster]");
    await expect(toaster).toHaveAttribute("data-sonner-theme", "light");

    await page.getByTestId("theme-system").click();
    await expect(toaster).toHaveAttribute("data-sonner-theme", "dark");

    await page.emulateMedia({ colorScheme: "light" });
    await expect(toaster).toHaveAttribute("data-sonner-theme", "light");
  });
});
