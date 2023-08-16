import { expect, test } from "@playwright/test";
import {
  DESKTOP_MENU_ITEMS,
  DESKTOP_SELECTOR,
  NEW_FILE_LABEL,
  NEW_FILE_LABEL_TEXT,
  NEW_FOLDER_LABEL,
  SELECTION_SELECTOR,
} from "e2e/constants";
import {
  appIsOpen,
  clickContextMenuEntry,
  clickDesktop,
  contextMenuEntryIsHidden,
  contextMenuEntryIsVisible,
  contextMenuHasCount,
  contextMenuIsVisible,
  desktopEntriesAreVisible,
  desktopEntryIsHidden,
  desktopEntryIsVisible,
  desktopIsVisible,
  disableWallpaper,
  filterMenuItems,
  loadApp,
  pressDesktopKeys,
  selectionIsVisible,
} from "e2e/functions";

test.beforeEach(disableWallpaper);
test.beforeEach(loadApp);
test.beforeEach(desktopIsVisible);

test("has file entry", desktopEntriesAreVisible);

// TEST: has grid (move file on grid)

test.describe("has selection", () => {
  test("has effect", async ({ page }) => {
    const { width = 0, height = 0 } =
      (await page.locator(DESKTOP_SELECTOR).boundingBox()) || {};

    const x = width / 2;
    const y = height / 2;
    const SELECTION_OFFSET = 25;

    await page.mouse.move(x, y);
    await page.mouse.down({ button: "left" });
    await page.mouse.move(x + SELECTION_OFFSET, y + SELECTION_OFFSET);

    await selectionIsVisible({ page });

    const boundingBox = await page.locator(SELECTION_SELECTOR).boundingBox();

    expect(boundingBox?.width).toEqual(SELECTION_OFFSET);
    expect(boundingBox?.height).toEqual(SELECTION_OFFSET);
    expect(boundingBox?.x).toEqual(x);
    expect(boundingBox?.y).toEqual(y);
  });

  // TEST: single/multi file
});

test.describe("has context menu", () => {
  test.beforeEach(async ({ page }) => clickDesktop({ page }, true));
  test.beforeEach(contextMenuIsVisible);

  test("has items", async ({ browserName, page }) => {
    const MENU_ITEMS = filterMenuItems(DESKTOP_MENU_ITEMS, browserName);
    const shownCount = MENU_ITEMS.filter(([, shown]) => shown).length;

    await contextMenuHasCount(shownCount, { page });

    for (const [label, shown] of MENU_ITEMS) {
      // eslint-disable-next-line no-await-in-loop
      await (shown
        ? contextMenuEntryIsVisible(label, { page })
        : contextMenuEntryIsHidden(label, { page }));
    }
  });

  test.describe("has file functions", () => {
    test.beforeEach(desktopEntriesAreVisible);

    test("can create folder", async ({ page }) => {
      await desktopEntryIsHidden(NEW_FOLDER_LABEL, { page });

      await clickContextMenuEntry(/^New$/, { page });
      await clickContextMenuEntry(/^Folder$/, { page });

      await desktopEntryIsVisible(NEW_FOLDER_LABEL, { page });

      await page.reload();

      await desktopEntriesAreVisible({ page });
      await desktopEntryIsVisible(NEW_FOLDER_LABEL, { page });
    });

    test("can create file", async ({ page }) => {
      await desktopEntryIsHidden(NEW_FILE_LABEL, { page });

      await clickContextMenuEntry(/^New$/, { page });
      await clickContextMenuEntry(/^Text Document$/, { page });

      await desktopEntryIsVisible(NEW_FILE_LABEL, { page });

      await page.reload();

      await desktopEntriesAreVisible({ page });
      await desktopEntryIsVisible(NEW_FILE_LABEL, { page });
    });

    test("can add file", async ({ page }) => {
      await desktopEntryIsHidden(NEW_FILE_LABEL, { page });

      const uploadPromise = page.waitForEvent("filechooser");

      await clickContextMenuEntry(/^Add file\(s\)$/, { page });

      await (
        await uploadPromise
      ).setFiles({
        buffer: Buffer.from(""),
        mimeType: "text/plain",
        name: NEW_FILE_LABEL_TEXT,
      });

      await desktopEntryIsVisible(NEW_FILE_LABEL, { page });
    });
  });

  test("can inspect page", async ({ page }) => {
    await clickContextMenuEntry(/^Inspect$/, { page });
    await appIsOpen(/^DevTools$/, page);
  });

  test("can view page source", async ({ page }) => {
    await clickContextMenuEntry(/^View page source$/, { page });
    await appIsOpen(/^index.html - Monaco Editor$/, page);
  });

  test("can open terminal", async ({ page }) => {
    await clickContextMenuEntry(/^Open Terminal here$/, { page });
    await appIsOpen(/^Terminal$/, page);
  });
});

test.describe("has keyboard shortcuts", () => {
  test("can open run dialog (ctrl + shift + r)", async ({ page }) => {
    await pressDesktopKeys("Control+Shift+KeyR", { page });
    await appIsOpen(/^Run$/, page);
  });

  test("can open file explorer (ctrl + shift + e)", async ({ page }) => {
    await pressDesktopKeys("Control+Shift+KeyE", { page });
    await appIsOpen(/^My PC$/, page);
  });

  test("can open terminal (shift + f10)", async ({ page }) => {
    await pressDesktopKeys("Shift+F10", { page });
    await appIsOpen(/^Terminal$/, page);
  });

  test("can inspect page (shift + f12)", async ({ page }) => {
    await pressDesktopKeys("Shift+F12", { page });
    await appIsOpen(/^DevTools$/, page);
  });

  // TEST: Shift+Escape (Start Menu)
  // TEST: F5 (Reload Page)
  // TEST: Meta+Up/Down (Min/Max Window)
  // TEST: Control+Shift+D (Show Desktop)
  // TEST: F11 & Escape (Fullscreen)
});
