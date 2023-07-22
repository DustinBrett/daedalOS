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
  clickContextMenuEntry,
  clickDesktop,
  contextMenuEntryIsHidden,
  contextMenuEntryIsVisible,
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
  taskbarEntryIsOpen,
} from "e2e/functions";

test.beforeEach(disableWallpaper);
test.beforeEach(loadApp);
test.beforeEach(desktopIsVisible);

test("has file entry", desktopEntriesAreVisible);

// TODO: has grid (move file on grid)

test.describe("has selection", () => {
  test("with effect", async ({ page }) => {
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

  // TODO: file entry (single/multi)
});

test.describe("has context menu", () => {
  test.beforeEach(async ({ page }) => clickDesktop({ page }, true));
  test.beforeEach(contextMenuIsVisible);

  test("with items", async ({ browserName, page }) => {
    for (const [label, shown] of filterMenuItems(
      DESKTOP_MENU_ITEMS,
      browserName
    )) {
      // eslint-disable-next-line no-await-in-loop
      await (shown
        ? contextMenuEntryIsVisible(label, { page })
        : contextMenuEntryIsHidden(label, { page }));
    }
  });

  test.describe("with file functions", () => {
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

  test("can inspect", async ({ page }) => {
    await clickContextMenuEntry(/^Inspect$/, { page });
    await taskbarEntryIsOpen(/^DevTools$/, page);
  });

  test("can view page source", async ({ page }) => {
    await clickContextMenuEntry(/^View page source$/, { page });
    await taskbarEntryIsOpen(
      /^index.html - Monaco Editor$/,
      page,
      Boolean(process.env.CI)
    );
  });

  test("can open terminal", async ({ page }) => {
    await clickContextMenuEntry(/^Open Terminal here$/, { page });
    await taskbarEntryIsOpen(/^Terminal$/, page);
  });
});

test.describe("has keyboard shortcuts", () => {
  test("ctrl + shift + r (open run dialog)", async ({ page }) => {
    await pressDesktopKeys("Control+Shift+KeyR", { page });
    await taskbarEntryIsOpen(/^Run$/, page);
  });

  test("ctrl + shift + e (open file explorer)", async ({ page }) => {
    await pressDesktopKeys("Control+Shift+KeyE", { page });
    await taskbarEntryIsOpen(/^My PC$/, page);
  });

  // TODO: Ctrl+Shift+D
  // TODO: Ctrl: ESCAPE, F10, F12
  // TODO: F11 (Fullscreen), Arrows
});
