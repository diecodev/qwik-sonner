import { expect, test, type Page } from "@playwright/test";

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

/** The `prefers-color-scheme` listener of `theme="system"` must not outlive it. */
test.describe("System theme listener", () => {
  // Count the live `change` listeners on `prefers-color-scheme` media queries.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { colorSchemeListeners: number };
      w.colorSchemeListeners = 0;
      const proto = MediaQueryList.prototype;
      const add = proto.addEventListener;
      const remove = proto.removeEventListener;
      proto.addEventListener = function (this: MediaQueryList, ...args: Parameters<typeof add>) {
        if (args[0] === "change" && this.media.includes("prefers-color-scheme")) {
          w.colorSchemeListeners++;
        }
        return add.apply(this, args);
      };
      proto.removeEventListener = function (
        this: MediaQueryList,
        ...args: Parameters<typeof remove>
      ) {
        if (args[0] === "change" && this.media.includes("prefers-color-scheme")) {
          w.colorSchemeListeners--;
        }
        return remove.apply(this, args);
      };
    });
  });

  const listeners = (page: Page) =>
    page.evaluate(
      () => (window as unknown as { colorSchemeListeners: number }).colorSchemeListeners,
    );

  test("is removed when the Toaster unmounts", async ({ page }) => {
    await page.goto("/theme/?theme=system");
    await expect.poll(() => listeners(page)).toBe(1);

    await page.getByTestId("toggle-toaster").click();
    await expect.poll(() => listeners(page)).toBe(0);
  });

  test("is removed when the prop leaves system", async ({ page }) => {
    await page.goto("/theme/?theme=system");
    await expect.poll(() => listeners(page)).toBe(1);

    await page.getByTestId("theme-light").click();
    await expect.poll(() => listeners(page)).toBe(0);
  });
});
