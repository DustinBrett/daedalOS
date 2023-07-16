import type { Locator } from "@playwright/test";
import { expect, test } from "@playwright/test";

const RIGHT_CLICK = { button: "right" } as Parameters<Locator["click"]>[0];

const CONTEXT_MENU_SELECTOR = "#__next>nav";
const WINDOW_SELECTOR = "main>.react-draggable>section";

const APP_TITLE = "daedalOS";
const BASE_TITLE = "My PC";
const TEST_SEARCH = "CREDITS";
const TEST_SEARCH_RESULT = /^CREDITS.md$/;
const MENU_ITEMS = [
  /^Open$/,
  /^Open with$/,
  /^Add to archive...$/,
  /^Download$/,
  /^Cut$/,
  /^Copy$/,
  /^Create shortcut$/,
  /^Delete$/,
  /^Rename$/,
  /^Properties$/,
];
const TEST_FILE = /^session.json$/;

test.describe("file explorer", () => {
  test.beforeEach(async ({ page }) => page.goto("/?app=FileExplorer"));

  test("has address bar", async ({ page }) => {
    const addressBar = page.locator(WINDOW_SELECTOR).getByLabel(/^Address$/);

    await expect(addressBar).toHaveValue(BASE_TITLE);

    await addressBar.click();

    await expect(addressBar).toHaveValue(/^\/$/);

    await addressBar.click(RIGHT_CLICK);

    await expect(
      page.locator(CONTEXT_MENU_SELECTOR).getByLabel(/^Copy address$/)
    ).toBeVisible();
  });

  test("has search box", async ({ page }) => {
    await page
      .locator(WINDOW_SELECTOR)
      .getByLabel(/^Search box$/)
      .fill(TEST_SEARCH);

    await expect(
      page.locator(CONTEXT_MENU_SELECTOR).getByLabel(TEST_SEARCH_RESULT)
    ).toBeVisible();
  });

  test("has file", async ({ page }) => {
    await page
      .locator(WINDOW_SELECTOR)
      .getByLabel(TEST_FILE)
      .click(RIGHT_CLICK);

    const menu = page.locator(CONTEXT_MENU_SELECTOR);

    for (const label of MENU_ITEMS) {
      // eslint-disable-next-line no-await-in-loop
      await expect(menu.getByLabel(label)).toBeVisible();
    }
  });

  test("has status bar", async ({ page }) => {
    const window = page.locator(WINDOW_SELECTOR);

    await window.getByLabel(TEST_FILE).click();

    await expect(window.getByLabel(/^Total item count$/)).toContainText(
      /^\d items$/
    );
    await expect(
      window.getByLabel(/^Selected item count and size$/)
    ).toContainText(/^1 item selected|\d{3} bytes$/);
  });

  test("changes title", async ({ page }) => {
    await expect(page).toHaveTitle(APP_TITLE);

    await page.locator(WINDOW_SELECTOR).click();

    await expect(page).toHaveTitle(`${BASE_TITLE} - ${APP_TITLE}`);
  });
});
