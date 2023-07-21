import { expect, test } from "@playwright/test";
import {
  BASE_APP_FAVICON,
  BASE_APP_TITLE,
  CONTEXT_MENU_SELECTOR,
  FILE_EXPLORER_STATUS_BAR_SELECTOR,
  FILE_MENU_ITEMS,
  TEST_APP_ICON,
  TEST_APP_TITLE,
  TEST_APP_TITLE_TEXT,
  TEST_ROOT_FILE,
  TEST_ROOT_FILE_TEXT,
  TEST_ROOT_FILE_TOOLTIP,
  TEST_SEARCH,
  TEST_SEARCH_RESULT,
} from "e2e/constants";
import {
  clickFileExplorerAddressBar,
  clickFileExplorerEntry,
  clickFirstDesktopEntry,
  contextMenuIsVisible,
  desktopEntriesAreVisible,
  fileExplorerAddressBarHasValue,
  fileExplorerEntriesAreVisible,
  fileExplorerEntryHasTooltip,
  fileExplorerEntryIsHidden,
  focusOnWindow,
  pageHasIcon,
  pageHasTitle,
  typeInFileExplorerSearchBox,
  windowsAreVisible,
} from "e2e/functions";

test.beforeEach(async ({ page }) => page.goto("/?app=FileExplorer"));
test.beforeEach(windowsAreVisible);

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

test.describe("has file(s)", () => {
  test.beforeEach(fileExplorerEntriesAreVisible);
  test.beforeEach(async ({ page }) =>
    clickFileExplorerEntry(TEST_ROOT_FILE, { page })
  );

  test.describe("has context menu", () => {
    test.beforeEach(async ({ page }) => {
      await clickFileExplorerEntry(TEST_ROOT_FILE, { page }, true);
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

      await windowsAreVisible({ page });
      await fileExplorerEntriesAreVisible({ page });
      await fileExplorerEntryIsHidden(TEST_ROOT_FILE, { page });
    });

    // TODO: can cut/copy->paste (to Desktop)
    // TODO: can set backgound (image/video)
    // TODO: can create shortcut (expect prepended name & icon)
  });

  test("has status bar", async ({ page }) => {
    const statusBar = page.locator(FILE_EXPLORER_STATUS_BAR_SELECTOR);
    const entryInfo = statusBar.getByLabel(/^Total item count$/);
    const selectedInfo = statusBar.getByLabel(/^Selected item count and size$/);

    await expect(entryInfo).toContainText(/^\d items$/);
    await expect(selectedInfo).toContainText(/^1 item selected|\d{3} bytes$/);
  });

  test("with tooltip", async ({ page, request }) => {
    await expect(await request.head(TEST_ROOT_FILE_TEXT)).toBeOK();
    await fileExplorerEntryHasTooltip(TEST_ROOT_FILE, TEST_ROOT_FILE_TOOLTIP, {
      page,
    });
  });

  // TODO: can drag (to Desktop)
  // TODO: can drop (from Desktop)
});

test("changes title", async ({ page }) => {
  const focusedAppPageTitle = `${TEST_APP_TITLE_TEXT} - ${BASE_APP_TITLE}`;

  await pageHasTitle(focusedAppPageTitle, { page });

  await desktopEntriesAreVisible({ page });
  await clickFirstDesktopEntry({ page });
  await pageHasTitle(BASE_APP_TITLE, { page });

  await focusOnWindow({ page });
  await pageHasTitle(focusedAppPageTitle, { page });
});

test("changes icon", async ({ page }) => {
  await pageHasIcon(TEST_APP_ICON, { page });

  await desktopEntriesAreVisible({ page });
  await clickFirstDesktopEntry({ page });
  await pageHasIcon(BASE_APP_FAVICON, { page });

  await focusOnWindow({ page });
  await pageHasIcon(TEST_APP_ICON, { page });
});

// TODO: has context menu (FOLDER_MENU_ITEMS)
// TODO: has back, forward, recent & up
// TODO: has keyboard shortcuts (Paste, Ctrl: C, X, V)
