import { expect, test } from "@playwright/test";
import {
  BASE_APP_TITLE,
  CONTEXT_MENU_SELECTOR,
  DESKTOP_FILE_ENTRY_SELECTOR,
  FILE_MENU_ITEMS,
  RIGHT_CLICK,
  TEST_APP_ICON,
  TEST_APP_TITLE,
  TEST_ROOT_FILE,
  TEST_SEARCH,
  TEST_SEARCH_RESULT,
  WINDOW_SELECTOR,
} from "e2e/constants";

test.describe("file explorer", () => {
  test.beforeEach(async ({ page }) => page.goto("/?app=FileExplorer"));

  test("has address bar", async ({ page }) => {
    const addressBar = page.locator(WINDOW_SELECTOR).getByLabel(/^Address$/);

    await expect(addressBar).toHaveValue(TEST_APP_TITLE);

    await addressBar.click();

    await expect(addressBar).toHaveValue("/");

    await addressBar.click(RIGHT_CLICK);

    await expect(
      page.locator(CONTEXT_MENU_SELECTOR).getByLabel(/^Copy address$/)
    ).toBeVisible();
  });

  test("has search box", async ({ page }) => {
    await page
      .locator(WINDOW_SELECTOR)
      .getByLabel(/^Search box$/)
      .type(TEST_SEARCH, {
        delay: 25,
      });

    await expect(
      page.locator(CONTEXT_MENU_SELECTOR).getByLabel(TEST_SEARCH_RESULT)
    ).toBeVisible();
  });

  test.describe("has file", () => {
    test("with context menu", async ({ page }) => {
      await page
        .locator(WINDOW_SELECTOR)
        .getByLabel(TEST_ROOT_FILE)
        .click(RIGHT_CLICK);

      const menu = page.locator(CONTEXT_MENU_SELECTOR);

      for (const label of FILE_MENU_ITEMS) {
        // eslint-disable-next-line no-await-in-loop
        await expect(menu.getByLabel(label)).toBeVisible();
      }
    });

    // TODO: with tooltip
    // TODO: with selection effect (single/multi)
    // TODO: has drag (to Desktop)
    // TODO: has drop (from Desktop)
    // TODO: has cut/copy->paste (to Desktop)
    // TODO: has download
    // TODO: can set backgound (image/video)
  });

  test("has status bar", async ({ page }) => {
    const windowElement = page.locator(WINDOW_SELECTOR);

    await windowElement.getByLabel(TEST_ROOT_FILE).click();

    await expect(windowElement.getByLabel(/^Total item count$/)).toContainText(
      /^\d items$/
    );
    await expect(
      windowElement.getByLabel(/^Selected item count and size$/)
    ).toContainText(/^1 item selected|\d{3} bytes$/);
  });

  test("changes title", async ({ page }) => {
    await expect(page).toHaveTitle(BASE_APP_TITLE);

    await page.locator(WINDOW_SELECTOR).click();

    await expect(page).toHaveTitle(`${TEST_APP_TITLE} - ${BASE_APP_TITLE}`);
  });

  test("changes icon", async ({ page }) => {
    const favIcon = page.locator("link[rel=icon]");

    await expect(favIcon).toBeHidden();

    await page.locator(WINDOW_SELECTOR).click();

    await expect(page.locator("link[rel=icon]")).toHaveAttribute(
      "href",
      TEST_APP_ICON
    );

    await page.locator(DESKTOP_FILE_ENTRY_SELECTOR).first().click();

    await expect(favIcon).toHaveAttribute("href", /^\/favicon.ico$/);
  });

  // TODO: has context menu (FOLDER_MENU_ITEMS)
  // TODO: has back, forward, recent & up
  // TODO: has keyboard shortcuts (Paste, Ctrl: C, X, V)
});
