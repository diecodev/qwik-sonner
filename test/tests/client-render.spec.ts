import { expect, test } from "@playwright/test";

/**
 * A `<Toaster>` that is first rendered on the client — behind a signal, or on a
 * page reached through a `<Link>` SPA navigation — never gets the `qinit` event
 * in Qwik 2.0.0-beta.37 (the qwikloader fires it once, at page load), so it has
 * to subscribe to the toast state on its own.
 */
test.describe("Client-rendered Toaster", () => {
  test("a Toaster mounted by a signal toggle renders toasts", async ({ page }) => {
    await page.goto("/client-toaster/");
    await page.getByTestId("toggle-toaster").click();
    await expect(page.locator("section[aria-label^='Notifications']")).toHaveCount(1);

    await page.getByTestId("fire-toast").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
  });

  test("a Toaster on a page reached with <Link> renders toasts", async ({ page }) => {
    await page.goto("/nav/");
    await page.getByTestId("nav-link").click();
    await expect(page).toHaveURL(/\/nav\/target\/$/);

    await page.getByTestId("fire-toast").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
  });

  test("a toast fired before the Toaster mounts is shown once it mounts", async ({ page }) => {
    await page.goto("/client-toaster/");
    await page.getByTestId("fire-toast").click();
    await page.getByTestId("toggle-toaster").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
  });

  test("the same page loaded directly (SSR) renders toasts", async ({ page }) => {
    await page.goto("/nav/target/");
    await page.getByTestId("fire-toast").click();
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
  });
});
