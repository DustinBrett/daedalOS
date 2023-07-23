import { expect, test } from "@playwright/test";
import {
  BASE_APP_FAVICON,
  BASE_APP_TITLE,
  FILE_EXPLORER_STATUS_BAR_SELECTOR,
  FILE_MENU_ITEMS,
  FOLDER_MENU_ITEMS,
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
  clickContextMenuEntry,
  clickFileExplorer,
  clickFileExplorerAddressBar,
  clickFileExplorerEntry,
  clickFileExplorerSearchBox,
  clickFirstDesktopEntry,
  contextMenuEntryIsHidden,
  contextMenuEntryIsVisible,
  contextMenuIsHidden,
  contextMenuIsVisible,
  disableWallpaper,
  fileExplorerAddressBarHasValue,
  fileExplorerEntriesAreVisible,
  fileExplorerEntryHasShortcutIcon,
  fileExplorerEntryHasTooltip,
  fileExplorerEntryIsHidden,
  fileExplorerEntryIsVisible,
  filterMenuItems,
  focusOnWindow,
  pageHasIcon,
  pageHasTitle,
  taskbarEntryIsOpen,
  typeInFileExplorerSearchBox,
  windowsAreVisible,
} from "e2e/functions";

test.beforeEach(disableWallpaper);
test.beforeEach(async ({ page }) => page.goto("/?app=FileExplorer"));
test.beforeEach(windowsAreVisible);
test.beforeEach(fileExplorerEntriesAreVisible);

test("has address bar", async ({ page }) => {
  await fileExplorerAddressBarHasValue(TEST_APP_TITLE, { page });
  await clickFileExplorerAddressBar({ page }, false, 2);
  await fileExplorerAddressBarHasValue("/", { page });

  await clickFileExplorerAddressBar({ page }, true);
  await contextMenuIsVisible({ page });
  await clickContextMenuEntry(/^Copy address$/, { page });

  // TODO: Test clipboard on clicking copy

  await contextMenuIsHidden({ page });
  await fileExplorerAddressBarHasValue(TEST_APP_TITLE, { page });
});

test("has search box", async ({ page }) => {
  await clickFileExplorerSearchBox({ page });
  await typeInFileExplorerSearchBox(TEST_SEARCH, { page });

  await contextMenuIsVisible({ page });
  await contextMenuEntryIsVisible(TEST_SEARCH_RESULT, { page });
});

test.describe("has file(s)", () => {
  test.describe("has context menu", () => {
    test.beforeEach(async ({ page }) => {
      await clickFileExplorerEntry(TEST_ROOT_FILE, { page }, true);
      await contextMenuIsVisible({ page });
    });

    test("with items", async ({ page }) => {
      for (const label of FILE_MENU_ITEMS) {
        // eslint-disable-next-line no-await-in-loop
        await contextMenuEntryIsVisible(label, { page });
      }
    });

    test("can download", async ({ page }) => {
      const downloadPromise = page.waitForEvent("download");

      await clickContextMenuEntry(/^Download$/, { page });

      const download = await downloadPromise;

      expect(await download.path()).toBeTruthy();
      expect(download.suggestedFilename()).toMatch(TEST_ROOT_FILE);
    });

    test("can delete", async ({ page }) => {
      await clickContextMenuEntry(/^Delete$/, { page });

      await fileExplorerEntryIsHidden(TEST_ROOT_FILE, { page });

      await page.reload();

      await windowsAreVisible({ page });
      await fileExplorerEntriesAreVisible({ page });
      await fileExplorerEntryIsHidden(TEST_ROOT_FILE, { page });
    });

    test("can create shortcut", async ({ page }) => {
      const shortcutFile = `${TEST_ROOT_FILE_TEXT} - Shortcut`;

      await fileExplorerEntryIsHidden(shortcutFile, { page });

      await clickContextMenuEntry(/^Create shortcut$/, { page });

      await fileExplorerEntryIsVisible(shortcutFile, { page });
      await fileExplorerEntryHasShortcutIcon(shortcutFile, { page });

      await page.reload();

      await windowsAreVisible({ page });
      await fileExplorerEntriesAreVisible({ page });
      await fileExplorerEntryIsVisible(shortcutFile, { page });
    });

    test("has properties", async ({ page }) => {
      await clickContextMenuEntry(/^Properties$/, { page });
      await taskbarEntryIsOpen(`${TEST_ROOT_FILE_TEXT} Properties`, page);
    });

    // TODO: can cut/copy->paste (to Desktop)
  });

  test("has status bar", async ({ page }) => {
    clickFileExplorerEntry(TEST_ROOT_FILE, { page });

    const statusBar = page.locator(FILE_EXPLORER_STATUS_BAR_SELECTOR);
    const entryInfo = statusBar.getByLabel(/^Total item count$/);
    const selectedInfo = statusBar.getByLabel(/^Selected item count and size$/);

    await expect(entryInfo).toContainText(/^\d items$/);
    await expect(selectedInfo).toContainText(/^1 item selected|\d{3} bytes$/);
  });

  test("with tooltip", async ({ page }) => {
    const responsePromise = page.waitForResponse(TEST_ROOT_FILE_TEXT);

    clickFileExplorerEntry(TEST_ROOT_FILE, { page });

    expect((await responsePromise).ok()).toBeTruthy();
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

  await clickFirstDesktopEntry({ page });
  await pageHasTitle(BASE_APP_TITLE, { page });

  await focusOnWindow({ page });
  await pageHasTitle(focusedAppPageTitle, { page });
});

test("changes icon", async ({ page }) => {
  await pageHasIcon(TEST_APP_ICON, { page });

  await clickFirstDesktopEntry({ page });
  await pageHasIcon(BASE_APP_FAVICON, { page });

  await focusOnWindow({ page });
  await pageHasIcon(TEST_APP_ICON, { page });
});

test.describe("has context menu", () => {
  test.beforeEach(async ({ page }) => {
    await clickFileExplorer({ page }, true);
    await contextMenuIsVisible({ page });
  });

  test("with items", async ({ browserName, page }) => {
    for (const [label, shown] of filterMenuItems(
      FOLDER_MENU_ITEMS,
      browserName
    )) {
      // eslint-disable-next-line no-await-in-loop
      await (shown
        ? contextMenuEntryIsVisible(label, { page })
        : contextMenuEntryIsHidden(label, { page }));
    }
  });
});

// TODO: has back, forward, recent & up
// TODO: has keyboard shortcuts (Paste, Ctrl: C, X, V)
