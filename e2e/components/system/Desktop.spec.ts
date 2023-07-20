import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  ACCESSIBILITY_EXCEPTION_IDS,
  CONTEXT_MENU_SELECTOR,
  DESKTOP_MENU_ITEMS,
  DESKTOP_SELECTOR,
  EXACT,
  NEW_FILE_LABEL,
  NEW_FILE_LABEL_TEXT,
  NEW_FOLDER_LABEL,
  SELECTION_SELECTOR,
  TASKBAR_ENTRIES_SELECTOR,
} from "e2e/constants";
import {
  backgroundIsUrl,
  canvasBackgroundIsHidden,
  canvasBackgroundIsVisible,
  clickDesktop,
  contextMenuIsVisible,
  desktopEntryIsHidden,
  desktopEntryIsVisible,
  desktopFileEntriesAreVisible,
  desktopIsVisible,
  loadApp,
  taskbarEntriesAreVisible,
} from "e2e/functions";

test.beforeEach(loadApp);
test.beforeEach(desktopIsVisible);

test("pass accessibility scan", async ({ page }) =>
  expect(
    (
      await new AxeBuilder({ page })
        .disableRules(ACCESSIBILITY_EXCEPTION_IDS)
        .analyze()
    ).violations
  ).toEqual([]));

test("has background", canvasBackgroundIsVisible);

test("has file entry", desktopFileEntriesAreVisible);

// TODO: has grid (move file on grid)

test.describe("has selection", () => {
  test("with effect", async ({ page }) => {
    const { width = 0, height = 0 } =
      (await page.locator(DESKTOP_SELECTOR).boundingBox()) || {};

    const x = width / 2;
    const y = height / 2;
    const SELECTION_OFFSET = 25;

    await page.mouse.move(x, y);
    await page.mouse.down({
      button: "left",
    });
    await page.mouse.move(x + SELECTION_OFFSET, y + SELECTION_OFFSET);

    await page.waitForSelector(SELECTION_SELECTOR);

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

test.describe("has context menu", () => {
  test.beforeEach(async ({ page }) => clickDesktop({ page }, true));
  test.beforeEach(contextMenuIsVisible);

  test("with items", async ({ browserName, page }) => {
    const items = page.locator(CONTEXT_MENU_SELECTOR);
    const MENU_ITEMS = Object.entries(DESKTOP_MENU_ITEMS).map(
      ([label, shown]) => [
        label,
        typeof shown === "boolean" ? shown : shown(browserName),
      ]
    );

    for (const [label, shown] of MENU_ITEMS) {
      // eslint-disable-next-line no-await-in-loop
      await expect(items.getByLabel(label as string, EXACT))[
        shown ? "toBeVisible" : "toBeHidden"
      ]();
    }
  });

  test.describe("with file functions", () => {
    test.beforeEach(desktopFileEntriesAreVisible);

    test("can create folder", async ({ page }) => {
      await desktopEntryIsHidden(NEW_FOLDER_LABEL, { page });

      await page.getByLabel(/^New$/).click();
      await page.getByLabel(/^Folder$/).click();

      await desktopEntryIsVisible(NEW_FOLDER_LABEL, { page });

      await page.reload();

      await desktopEntryIsVisible(NEW_FOLDER_LABEL, { page });
    });

    test("can create file", async ({ page }) => {
      await desktopEntryIsHidden(NEW_FILE_LABEL, { page });

      await page.getByLabel(/^New$/).click();
      await page.getByLabel(/^Text Document$/).click();

      await desktopEntryIsVisible(NEW_FILE_LABEL, { page });

      await page.reload();

      await desktopEntryIsVisible(NEW_FILE_LABEL, { page });
    });

    test("can add file", async ({ page }) => {
      await desktopEntryIsHidden(NEW_FILE_LABEL, { page });

      const uploadPromise = page.waitForEvent("filechooser");

      await page.getByLabel(/^Add file\(s\)$/).click();

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

  test("can change background", async ({ page }) => {
    await canvasBackgroundIsVisible({ page });

    await page.getByLabel(/^Background$/).click();
    await page.getByLabel(/^Picture Slideshow$/).click();

    await canvasBackgroundIsHidden({ page });
    await backgroundIsUrl({ page });

    await page.reload();

    await canvasBackgroundIsHidden({ page });
    await backgroundIsUrl({ page });
  });

  test("can inspect", async ({ page }) => {
    await page.getByLabel(/^Inspect$/).click();

    await taskbarEntriesAreVisible({ page });

    await expect(
      page.locator(TASKBAR_ENTRIES_SELECTOR).getByLabel(/^DevTools$/)
    ).toBeVisible();
  });

  test("can view page source", async ({ page }) => {
    await page.getByLabel(/^View page source$/).click();

    await taskbarEntriesAreVisible({ page });

    await expect(
      page
        .locator(TASKBAR_ENTRIES_SELECTOR)
        .getByLabel(/^index.html - Monaco Editor$/)
    ).toBeVisible();
  });

  test("can open terminal", async ({ page }) => {
    await page.getByLabel(/^Open Terminal here$/).click();

    await taskbarEntriesAreVisible({ page });

    await expect(
      page.locator(TASKBAR_ENTRIES_SELECTOR).getByLabel(/^Terminal$/)
    ).toBeVisible();
  });
});

test.describe("has keyboard shortcuts", () => {
  test("ctrl + shift + r (open run dialog)", async ({ page }) => {
    await page.locator(DESKTOP_SELECTOR).press("Control+Shift+KeyR");

    await taskbarEntriesAreVisible({ page });

    await expect(
      page.locator(TASKBAR_ENTRIES_SELECTOR).getByLabel(/^Run$/)
    ).toBeVisible();
  });

  test("ctrl + shift + e (open file explorer)", async ({ page }) => {
    await page.locator(DESKTOP_SELECTOR).press("Control+Shift+KeyE");

    await taskbarEntriesAreVisible({ page });

    await expect(
      page.locator(TASKBAR_ENTRIES_SELECTOR).getByLabel(/^File Explorer$/)
    ).toBeVisible();
  });

  // TODO: Ctrl+Shift+D
  // TODO: Ctrl: ESCAPE, F10, F12
  // TODO: F11 (Fullscreen), Arrows
});
