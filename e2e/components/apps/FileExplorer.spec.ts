import { expect, test } from "@playwright/test";
import {
  BASE_APP_TITLE,
  CONTEXT_MENU_SELECTOR,
  DESKTOP_FILE_ENTRY_SELECTOR,
  FILE_MENU_ITEMS,
  RIGHT_CLICK,
  SELECTION_SELECTOR,
  TEST_APP_ICON,
  TEST_APP_TITLE,
  TEST_ROOT_FILE,
  TEST_ROOT_FILE_TOOLTIP,
  TEST_SEARCH,
  TEST_SEARCH_RESULT,
  WINDOW_SELECTOR,
} from "e2e/constants";

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
  test.describe("has context menu", () => {
    test.beforeEach(async ({ page }) =>
      page
        .locator(WINDOW_SELECTOR)
        .getByLabel(TEST_ROOT_FILE)
        .click(RIGHT_CLICK)
    );

    test("with items", async ({ page }) => {
      const menu = page.locator(CONTEXT_MENU_SELECTOR);

      for (const label of FILE_MENU_ITEMS) {
        // eslint-disable-next-line no-await-in-loop
        await expect(menu.getByLabel(label)).toBeVisible();
      }
    });

    test("can download", async ({ page }) => {
      const downloadPromise = page.waitForEvent("download");

      await page.getByLabel(/^Download$/).click();

      const download = await downloadPromise;

      expect(await download.path()).toBeTruthy();
      expect(download.suggestedFilename()).toMatch(TEST_ROOT_FILE);
    });

    test("can delete", async ({ page }) => {
      const rootFile = page.locator(WINDOW_SELECTOR).getByLabel(TEST_ROOT_FILE);

      await expect(rootFile).toBeVisible();

      await page.getByLabel(/^Delete$/).click();

      await expect(rootFile).toBeHidden();

      await page.reload();

      await expect(rootFile).toBeHidden();
    });

    // TODO: can cut/copy->paste (to Desktop)
    // TODO: can set backgound (image/video)
    // TODO: can create shortcut (expect prepended name & icon)
  });

  test("with tooltip", async ({ page }) => {
    const testFile = page.locator(WINDOW_SELECTOR).getByLabel(TEST_ROOT_FILE);

    await testFile.click();

    expect(await testFile.getAttribute("title")).toMatch(
      TEST_ROOT_FILE_TOOLTIP
    );
  });

  test.describe("with selection", () => {
    test("effect", async ({ page }) => {
      const viewport = page.viewportSize();
      // eslint-disable-next-line playwright/no-conditional-in-test
      const x = (viewport?.width || 0) / 2;
      // eslint-disable-next-line playwright/no-conditional-in-test
      const y = (viewport?.height || 0) / 2;
      const SELECTION_OFFSET = 25;

      await page.mouse.move(x, y);
      await page.mouse.down({
        button: "left",
      });
      await page.mouse.move(x + SELECTION_OFFSET, y + SELECTION_OFFSET);

      const selection = page.locator(SELECTION_SELECTOR);

      await expect(selection).toBeVisible();

      const boundingBox = await selection.boundingBox();

      expect(boundingBox?.width).toEqual(SELECTION_OFFSET);
      expect(boundingBox?.height).toEqual(SELECTION_OFFSET);
      expect(boundingBox?.x).toEqual(x);
      expect(boundingBox?.y).toEqual(y);
    });

    // TODO: file entry (single/multi)
  });

  // TODO: can drag (to Desktop)
  // TODO: can drop (from Desktop)
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
