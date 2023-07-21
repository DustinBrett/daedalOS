import { expect, test } from "@playwright/test";
import {
  BASE_APP_FAVICON,
  BASE_APP_TITLE,
  CONTEXT_MENU_SELECTOR,
  FILE_EXPLORER_STATUS_BAR_SELECTOR,
  FILE_MENU_ITEMS,
  RIGHT_CLICK,
  TEST_APP_ICON,
  TEST_APP_TITLE,
  TEST_APP_TITLE_TEXT,
  TEST_ROOT_FILE,
  TEST_ROOT_FILE_TEXT,
  TEST_ROOT_FILE_TOOLTIP,
  TEST_SEARCH,
  TEST_SEARCH_RESULT,
  WINDOW_SELECTOR,
} from "e2e/constants";
import {
  clickFileExplorerAddressBar,
  clickFileExplorerEntry,
  clickFirstDesktopEntry,
  contextMenuIsVisible,
  desktopFileEntriesAreVisible,
  fileExplorerAddressBarHasValue,
  fileExplorerEntriesAreVisible,
  fileExplorerEntryIsHidden,
  fileExplorerEntryIsVisible,
  focusOnWindow,
  pageHasIcon,
  pageHasTitle,
  typeInFileExplorerSearchBox,
  windowIsVisible,
} from "e2e/functions";

test.beforeEach(async ({ page }) => page.goto("/?app=FileExplorer"));
test.beforeEach(windowIsVisible);

test("has address bar", async ({ page }) => {
  await fileExplorerAddressBarHasValue(TEST_APP_TITLE, { page });
  await clickFileExplorerAddressBar({ page });
  await fileExplorerAddressBarHasValue("/", { page });

  await clickFileExplorerAddressBar({ page }, true);
  await contextMenuIsVisible({ page });
  await expect(
    page.locator(CONTEXT_MENU_SELECTOR).getByLabel(/^Copy address$/)
  ).toBeVisible();

  // TODO: Test clipboard on clicking copy
  // TODO: Test title after clicking copy changes back to My PC
});

test("has search box", async ({ page }) => {
  await typeInFileExplorerSearchBox(TEST_SEARCH, { page });
  await contextMenuIsVisible({ page });
  await expect(
    page.locator(CONTEXT_MENU_SELECTOR).getByLabel(TEST_SEARCH_RESULT)
  ).toBeVisible();
});

test("has status bar", async ({ page }) => {
  await fileExplorerEntriesAreVisible({ page });
  await fileExplorerEntryIsVisible(TEST_ROOT_FILE, { page });
  await clickFileExplorerEntry(TEST_ROOT_FILE, { page });

  const statusBar = page.locator(FILE_EXPLORER_STATUS_BAR_SELECTOR);
  const entryInfo = statusBar.getByLabel(/^Total item count$/);
  const selectedInfo = statusBar.getByLabel(/^Selected item count and size$/);

  await expect(entryInfo).toContainText(/^\d items$/);
  await expect(selectedInfo).toContainText(/^1 item selected|\d{3} bytes$/);
});

test("changes title", async ({ page }) => {
  const focusedAppPageTitle = `${TEST_APP_TITLE_TEXT} - ${BASE_APP_TITLE}`;

  await pageHasTitle(focusedAppPageTitle, { page });

  await desktopFileEntriesAreVisible({ page });
  await clickFirstDesktopEntry({ page });
  await pageHasTitle(BASE_APP_TITLE, { page });

  await focusOnWindow({ page });
  await pageHasTitle(focusedAppPageTitle, { page });
});

test("changes icon", async ({ page }) => {
  await pageHasIcon(TEST_APP_ICON, { page });

  await desktopFileEntriesAreVisible({ page });
  await clickFirstDesktopEntry({ page });
  await pageHasIcon(BASE_APP_FAVICON, { page });

  await focusOnWindow({ page });
  await pageHasIcon(TEST_APP_ICON, { page });
});

test.describe("has file", () => {
  test.describe("has context menu", () => {
    test.beforeEach(async ({ page }) => {
      page
        .locator(WINDOW_SELECTOR)
        .getByLabel(TEST_ROOT_FILE)
        .click(RIGHT_CLICK);

      await contextMenuIsVisible({ page });
    });

    test("with items", async ({ page }) => {
      const menu = page.locator(CONTEXT_MENU_SELECTOR);

      for (const label of FILE_MENU_ITEMS) {
        // eslint-disable-next-line no-await-in-loop
        await expect(menu.getByLabel(label)).toBeVisible();
      }
    });

    test("can download", async ({ page }) => {
      const downloadPromise = page.waitForEvent("download");

      await page
        .locator(CONTEXT_MENU_SELECTOR)
        .getByLabel(/^Download$/)
        .click();

      const download = await downloadPromise;

      expect(await download.path()).toBeTruthy();
      expect(download.suggestedFilename()).toMatch(TEST_ROOT_FILE);
    });

    test("can delete", async ({ page }) => {
      await page
        .locator(CONTEXT_MENU_SELECTOR)
        .getByLabel(/^Delete$/)
        .click();

      await fileExplorerEntryIsHidden(TEST_ROOT_FILE, { page });

      await page.reload();

      await windowIsVisible({ page });

      await fileExplorerEntryIsHidden(TEST_ROOT_FILE, { page });
    });

    // TODO: can cut/copy->paste (to Desktop)
    // TODO: can set backgound (image/video)
    // TODO: can create shortcut (expect prepended name & icon)
  });

  test("with tooltip", async ({ page, request }) => {
    const testFile = page.locator(WINDOW_SELECTOR).getByLabel(TEST_ROOT_FILE);

    // Q: Why both?
    await testFile.hover();
    await testFile.click();

    const statsRequest = await request.head(TEST_ROOT_FILE_TEXT);

    await expect(statsRequest).toBeOK();

    await expect
      .poll(() => testFile.getAttribute("title"))
      .toMatch(TEST_ROOT_FILE_TOOLTIP);
  });

  // TODO: can drag (to Desktop)
  // TODO: can drop (from Desktop)
});

// TODO: has context menu (FOLDER_MENU_ITEMS)
// TODO: has back, forward, recent & up
// TODO: has keyboard shortcuts (Paste, Ctrl: C, X, V)
