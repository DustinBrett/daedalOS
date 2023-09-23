import { expect, test } from "@playwright/test";
import {
  BASE_APP_FAVICON,
  BASE_APP_TITLE,
  DESKTOP_SELECTOR,
  DRAG_HEADLESS_NOT_SUPPORTED_BROWSERS,
  FILE_EXPLORER_ENTRIES_FOCUSED_SELECTOR,
  FILE_EXPLORER_STATUS_BAR_SELECTOR,
  FILE_MENU_ITEMS,
  FOLDER_MENU_ITEMS,
  TEST_APP_ICON,
  TEST_APP_TITLE,
  TEST_APP_TITLE_TEXT,
  TEST_ROOT_ARCHIVE,
  TEST_ROOT_FILE,
  TEST_ROOT_FILE_2,
  TEST_ROOT_FILE_ALT_APP,
  TEST_ROOT_FILE_DEFAULT_APP,
  TEST_ROOT_FILE_TEXT,
  TEST_ROOT_FILE_TOOLTIP,
  TEST_SEARCH,
  TEST_SEARCH_RESULT,
} from "e2e/constants";
import {
  appIsOpen,
  clickContextMenuEntry,
  clickDesktop,
  clickFileExplorer,
  clickFileExplorerAddressBar,
  clickFileExplorerEntry,
  clickFileExplorerNavButton,
  clickFileExplorerSearchBox,
  clickFirstDesktopEntry,
  contextMenuEntryIsHidden,
  contextMenuEntryIsVisible,
  contextMenuHasCount,
  contextMenuIsHidden,
  contextMenuIsVisible,
  desktopEntryIsHidden,
  desktopEntryIsVisible,
  disableWallpaper,
  dragFileExplorerEntryToDesktop,
  fileExplorerAddressBarHasValue,
  fileExplorerEntriesAreVisible,
  fileExplorerEntryHasShortcutIcon,
  fileExplorerEntryHasTooltip,
  fileExplorerEntryIsHidden,
  fileExplorerEntryIsVisible,
  fileExplorerNavButtonIsVisible,
  fileExplorerRenameEntry,
  filterMenuItems,
  focusOnWindow,
  pageHasIcon,
  pageHasTitle,
  pressFileExplorerAddressBarKeys,
  pressFileExplorerEntryKeys,
  typeInFileExplorerAddressBar,
  typeInFileExplorerSearchBox,
  windowTitlebarTextIsVisible,
  windowsAreVisible,
} from "e2e/functions";
import { dirname, extname } from "path";

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

  await contextMenuIsHidden({ page });
  await fileExplorerAddressBarHasValue(TEST_APP_TITLE, { page });

  await typeInFileExplorerAddressBar("/System", { page });
  await pressFileExplorerAddressBarKeys("Enter", { page });

  await fileExplorerAddressBarHasValue("System", { page });
  await fileExplorerEntryIsVisible("Icons", { page });
});

test("can search", async ({ page }) => {
  await clickFileExplorerSearchBox({ page });
  await typeInFileExplorerSearchBox(TEST_SEARCH, { page });

  await contextMenuIsVisible({ page });
  await contextMenuEntryIsVisible(TEST_SEARCH_RESULT, { page });
});

test.describe("has files & folders", () => {
  test.describe("has context menu", () => {
    test.beforeEach(async ({ page }) => {
      await clickFileExplorerEntry(TEST_ROOT_FILE, { page }, true);
      await contextMenuIsVisible({ page });
    });

    test("has items", async ({ page }) => {
      await contextMenuHasCount(FILE_MENU_ITEMS.length, { page });

      for (const label of FILE_MENU_ITEMS) {
        // eslint-disable-next-line no-await-in-loop
        await contextMenuEntryIsVisible(label, { page });
      }
    });

    test("can open", async ({ page }) => {
      await clickContextMenuEntry(/^Open$/, { page });
      await windowTitlebarTextIsVisible(
        `${TEST_ROOT_FILE_TEXT} - ${TEST_ROOT_FILE_DEFAULT_APP}`,
        { page }
      );
    });

    test("can open with", async ({ page }) => {
      await clickContextMenuEntry(/^Open with$/, { page });
      await clickContextMenuEntry(TEST_ROOT_FILE_ALT_APP, { page });
      await windowTitlebarTextIsVisible(
        `${TEST_ROOT_FILE_TEXT} - ${TEST_ROOT_FILE_ALT_APP}`,
        { page }
      );
    });

    test("can download", async ({ page }) => {
      const downloadPromise = page.waitForEvent("download");

      await clickContextMenuEntry(/^Download$/, { page });

      const download = await downloadPromise;

      expect(await download.path()).toBeTruthy();
      expect(download.suggestedFilename()).toMatch(TEST_ROOT_FILE);
    });

    test("can cut", async ({ page }) => {
      await clickContextMenuEntry(/^Cut$/, { page });

      const { width = 0 } =
        (await page.locator(DESKTOP_SELECTOR).boundingBox()) || {};

      await clickDesktop({ page }, true, width - 25, 25);
      await contextMenuIsVisible({ page });
      await clickContextMenuEntry(/^Paste$/, { page });

      await desktopEntryIsVisible(TEST_ROOT_FILE, { page });
      await fileExplorerEntryIsHidden(TEST_ROOT_FILE, { page });
    });

    test("can copy", async ({ page }) => {
      await clickContextMenuEntry(/^Copy$/, { page });

      const { width = 0 } =
        (await page.locator(DESKTOP_SELECTOR).boundingBox()) || {};

      await clickDesktop({ page }, true, width - 25, 25);
      await contextMenuIsVisible({ page });
      await clickContextMenuEntry(/^Paste$/, { page });

      // TEST: copy dialog shows

      await desktopEntryIsVisible(TEST_ROOT_FILE, { page });
      await fileExplorerEntryIsVisible(TEST_ROOT_FILE, { page });
    });

    // TEST: can delete empty/non-empty folder
    test("can delete file", async ({ page }) => {
      await clickContextMenuEntry(/^Delete$/, { page });

      await fileExplorerEntryIsHidden(TEST_ROOT_FILE, { page });

      await page.reload();

      await windowsAreVisible({ page });
      await fileExplorerEntriesAreVisible({ page });
      await fileExplorerEntryIsHidden(TEST_ROOT_FILE, { page });
    });

    test("can rename", async ({ page }) => {
      await clickContextMenuEntry(/^Rename$/, { page });

      const flippedName = [...dirname(TEST_ROOT_FILE_TEXT)].reverse().join("");

      await fileExplorerRenameEntry(flippedName, { page });
      await fileExplorerEntryIsVisible(
        `${flippedName}${extname(TEST_ROOT_FILE_TEXT)}`,
        { page }
      );
    });

    test("can archive", async ({ page }) => {
      await clickContextMenuEntry(/^Add to archive...$/, { page });
      await fileExplorerEntryIsVisible(TEST_ROOT_ARCHIVE, { page });
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
      await appIsOpen(`${TEST_ROOT_FILE_TEXT} Properties`, page);
    });
  });

  test("can rename via F2", async ({ page }) => {
    await pressFileExplorerEntryKeys(TEST_ROOT_FILE, "F2", { page });

    const flippedName = [...dirname(TEST_ROOT_FILE_TEXT)].reverse().join("");

    await fileExplorerRenameEntry(flippedName, { page });
    await fileExplorerEntryIsVisible(
      `${flippedName}${extname(TEST_ROOT_FILE_TEXT)}`,
      { page }
    );
  });

  test("has status bar", async ({ page }) => {
    await clickFileExplorerEntry(TEST_ROOT_FILE, { page });

    const statusBar = page.locator(FILE_EXPLORER_STATUS_BAR_SELECTOR);
    const entryInfo = statusBar.getByLabel(/^Total item count$/);
    const selectedInfo = statusBar.getByLabel(/^Selected item count and size$/);

    await expect(entryInfo).toContainText(/^\d items$/);
    await expect(selectedInfo).toContainText(/^1 item selected|\d{3} bytes$/);

    expect(
      await page.locator(FILE_EXPLORER_ENTRIES_FOCUSED_SELECTOR).count()
    ).toEqual(1);

    await page.keyboard.down("Control");
    await clickFileExplorerEntry(TEST_ROOT_FILE_2, { page });

    await expect(selectedInfo).toContainText(/^2 items selected|\d{3} KB$/);

    expect(
      await page.locator(FILE_EXPLORER_ENTRIES_FOCUSED_SELECTOR).count()
    ).toEqual(2);
  });

  test("has tooltip", async ({ page }) => {
    const responsePromise = page.waitForResponse(TEST_ROOT_FILE_TEXT);

    await clickFileExplorerEntry(TEST_ROOT_FILE, { page });

    expect((await responsePromise).ok()).toBeTruthy();
    await fileExplorerEntryHasTooltip(TEST_ROOT_FILE, TEST_ROOT_FILE_TOOLTIP, {
      page,
    });
  });

  test.describe("can open", () => {
    test("via double click", async ({ page }) => {
      await clickFileExplorerEntry(TEST_ROOT_FILE, { page }, false, 2);
      await windowTitlebarTextIsVisible(
        `${TEST_ROOT_FILE_TEXT} - ${TEST_ROOT_FILE_DEFAULT_APP}`,
        { page }
      );
    });

    test("via enter", async ({ page }) => {
      await pressFileExplorerEntryKeys(TEST_ROOT_FILE, "Enter", { page });
      await windowTitlebarTextIsVisible(
        `${TEST_ROOT_FILE_TEXT} - ${TEST_ROOT_FILE_DEFAULT_APP}`,
        { page }
      );
    });
  });

  test("can drag to desktop", async ({ browserName, headless, page }) => {
    test.skip(
      headless && DRAG_HEADLESS_NOT_SUPPORTED_BROWSERS.has(browserName),
      "no headless drag support"
    );

    await desktopEntryIsHidden(TEST_ROOT_FILE, { page });
    await fileExplorerEntryIsVisible(TEST_ROOT_FILE, { page });
    await dragFileExplorerEntryToDesktop(TEST_ROOT_FILE, { page });
    await desktopEntryIsVisible(TEST_ROOT_FILE, { page });
  });

  // TEST: can drop (from Desktop)
});

test("can change page title", async ({ page }) => {
  const focusedAppPageTitle = `${TEST_APP_TITLE_TEXT} - ${BASE_APP_TITLE}`;

  await pageHasTitle(focusedAppPageTitle, { page });

  await clickFirstDesktopEntry({ page });
  await pageHasTitle(BASE_APP_TITLE, { page });

  await focusOnWindow({ page });
  await pageHasTitle(focusedAppPageTitle, { page });
});

test("can change page icon", async ({ page }) => {
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

  test("has items", async ({ browserName, page }) => {
    const MENU_ITEMS = filterMenuItems(FOLDER_MENU_ITEMS, browserName);
    const shownCount = MENU_ITEMS.filter(([, shown]) => shown).length;

    await contextMenuHasCount(shownCount, { page });

    for (const [label, shown] of MENU_ITEMS) {
      // eslint-disable-next-line no-await-in-loop
      await (shown
        ? contextMenuEntryIsVisible(label, { page })
        : contextMenuEntryIsHidden(label, { page }));
    }
  });

  test("has properties", async ({ page }) => {
    await clickContextMenuEntry(/^Properties$/, { page });
    await appIsOpen(/^Properties$/, page);
  });
});

test.describe("has navigation", () => {
  test.beforeEach(async ({ page }) => {
    await clickFileExplorerEntry(/^System$/, { page }, false, 2);
    await windowTitlebarTextIsVisible(/^System$/, { page });
  });

  test("can go back & forward", async ({ page }) => {
    await fileExplorerEntriesAreVisible({ page });

    await typeInFileExplorerAddressBar("/Users", { page });
    await pressFileExplorerAddressBarKeys("Enter", { page });
    await windowTitlebarTextIsVisible(/^Users$/, { page });

    await fileExplorerNavButtonIsVisible(/^Back to System$/, { page });
    await fileExplorerNavButtonIsVisible(/^Up to "My PC"$/, { page });

    await clickFileExplorerNavButton(/^Back to System$/, { page });
    await windowTitlebarTextIsVisible(/^System$/, { page });

    await fileExplorerNavButtonIsVisible(/^Back to My PC$/, { page });
    await fileExplorerNavButtonIsVisible(/^Forward to Users$/, { page });
    await fileExplorerNavButtonIsVisible(/^Up to "My PC"$/, { page });
  });

  test("can go up", async ({ page }) => {
    await clickFileExplorerEntry(/^Icons$/, { page }, false, 2);
    await windowTitlebarTextIsVisible(/^Icons$/, { page });

    await fileExplorerNavButtonIsVisible(/^Back to System$/, { page });
    await fileExplorerNavButtonIsVisible(/^Up to "System"$/, { page });

    await clickFileExplorerNavButton(/^Up to "System"$/, { page });
    await windowTitlebarTextIsVisible(/^System$/, { page });

    await fileExplorerNavButtonIsVisible(/^Back to Icons$/, { page });
    await fileExplorerNavButtonIsVisible(/^Up to "My PC"$/, { page });
  });

  test("has recent locations", async ({ page }) => {
    await fileExplorerEntriesAreVisible({ page });
    await clickFileExplorerNavButton(/^Recent locations$/, { page });

    await contextMenuEntryIsVisible(/^My PC$/, { page });
    await contextMenuEntryIsVisible(/^System$/, { page });
    await contextMenuHasCount(2, { page });

    await clickContextMenuEntry(/^My PC$/, { page });
    await windowTitlebarTextIsVisible(/^My PC$/, { page });
  });
});

// TEST: has keyboard shortcuts (Arrows, Ctrl: A, C, X, V, Backspace, Delete, Multi-select via Ctrl)
