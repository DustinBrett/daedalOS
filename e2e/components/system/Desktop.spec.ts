import { expect, test } from "@playwright/test";
import {
  DESKTOP_MENU_ITEMS,
  DESKTOP_SELECTOR,
  NEW_FILE_LABEL,
  NEW_FILE_LABEL_TEXT,
  NEW_FOLDER_LABEL,
} from "e2e/constants";
import {
  appIsOpen,
  captureConsoleLogs,
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
  selectArea,
} from "e2e/functions";

test.beforeEach(captureConsoleLogs());
test.beforeEach(disableWallpaper);
test.beforeEach(loadApp());
test.beforeEach(desktopIsVisible);

test("has file entry", desktopEntriesAreVisible);

test.describe("has selection", () => {
  test("has effect", async ({ page }) => {
    const { width = 0, height = 0 } =
      (await page.locator(DESKTOP_SELECTOR).boundingBox()) || {};

    await selectArea({
      page,
      selection: { height: 25, width: 25, x: width / 2, y: height / 2 },
    });
  });

  test("can select entry", async ({ page }) => {
    await desktopEntriesAreVisible({ page });
    await selectArea({
      page,
      selection: { height: 80, up: true, width: 70, x: 0, y: 0 },
    });
    await expect(page.locator(".focus-within")).toHaveCount(1);
  });
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
});
