import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  ACCESSIBILITY_EXCEPTION_IDS,
  BACKGROUND_CANVAS_SELECTOR,
  CONTEXT_MENU_SELECTOR,
  DESKTOP_FILE_ENTRY_SELECTOR,
  DESKTOP_MENU_ITEMS,
  EXACT,
  NEW_FILE_LABEL,
  NEW_FILE_LABEL_TEXT,
  NEW_FOLDER_LABEL,
  RIGHT_CLICK,
  TASKBAR_ENTRY_SELECTOR,
} from "e2e/constants";

test.beforeEach(async ({ page }) => page.goto("/"));

test("pass accessibility scan", async ({ page }) =>
  expect(
    (
      await new AxeBuilder({ page })
        .disableRules(ACCESSIBILITY_EXCEPTION_IDS)
        .analyze()
    ).violations
  ).toEqual([]));

test("has background", async ({ page }) => {
  await expect(page.locator(BACKGROUND_CANVAS_SELECTOR)).toBeVisible();
});

test("has file entry", async ({ page }) => {
  await expect(page.locator(DESKTOP_FILE_ENTRY_SELECTOR).first()).toBeVisible();
});

// TODO: has grid (move file on grid)

test.describe("has context menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole("main").click(RIGHT_CLICK);
  });

  test("with items", async ({ browserName, page }) => {
    const MENU_ITEMS = Object.entries(DESKTOP_MENU_ITEMS).map(
      ([label, shown]) => [
        label,
        typeof shown === "boolean" ? shown : shown(browserName),
      ]
    );
    const menuItems = page.locator(CONTEXT_MENU_SELECTOR);

    for (const [label, shown] of MENU_ITEMS) {
      // eslint-disable-next-line no-await-in-loop
      await expect(menuItems.getByLabel(label as string, EXACT))[
        shown ? "toBeVisible" : "toBeHidden"
      ]();
    }
  });

  test("can change background", async ({ page }) => {
    await expect(page.locator(BACKGROUND_CANVAS_SELECTOR)).toBeVisible();

    await page.getByLabel(/^Background$/).click();
    await page.getByLabel(/^APOD$/).click();

    await expect(page.locator(BACKGROUND_CANVAS_SELECTOR)).toBeHidden();

    expect(
      await page.waitForFunction(
        ([selectorProperty, selectorValue]) =>
          window
            .getComputedStyle(document.documentElement)
            .getPropertyValue(selectorProperty)
            .match(selectorValue),
        ["background-image", /^url\(.*?\)$/] as [string, RegExp]
      )
    ).toBeTruthy();

    await page.reload();

    await expect(page.locator(BACKGROUND_CANVAS_SELECTOR)).toBeHidden();
  });

  test("can create folder", async ({ page }) => {
    await expect(page.getByLabel(NEW_FOLDER_LABEL)).toBeHidden();

    await page.getByLabel(/^New$/).click();
    await page.getByLabel(/^Folder$/).click();

    await page.getByRole("main").click();

    await expect(page.getByLabel(NEW_FOLDER_LABEL)).toBeVisible();

    await page.reload();

    await expect(page.getByLabel(NEW_FOLDER_LABEL)).toBeVisible();
  });

  test("can create file", async ({ page }) => {
    await expect(page.getByLabel(NEW_FILE_LABEL)).toBeHidden();

    await page.getByLabel(/^New$/).click();
    await page.getByLabel(/^Text Document$/).click();

    await page.getByRole("main").click();

    await expect(page.getByLabel(NEW_FILE_LABEL)).toBeVisible();

    await page.reload();

    await expect(page.getByLabel(NEW_FILE_LABEL)).toBeVisible();
  });

  test("can add file", async ({ page }) => {
    const uploadPromise = page.waitForEvent("filechooser");

    await page.getByLabel(/^Add file\(s\)$/).click();

    await (
      await uploadPromise
    ).setFiles({
      buffer: Buffer.from(""),
      mimeType: "text/plain",
      name: NEW_FILE_LABEL_TEXT,
    });

    await expect(page.getByLabel(NEW_FILE_LABEL)).toBeVisible();
  });

  test("can inspect", async ({ page }) => {
    await page.getByLabel(/^Inspect$/).click();

    await expect(
      page.locator(TASKBAR_ENTRY_SELECTOR).getByLabel(/^DevTools$/)
    ).toBeVisible();
  });

  test("can view page source", async ({ page }) => {
    await page.getByLabel(/^View page source$/).click();

    await expect(
      page
        .locator(TASKBAR_ENTRY_SELECTOR)
        .getByLabel(/^index.html - Monaco Editor$/)
    ).toBeVisible();
  });

  test("can open terminal", async ({ page }) => {
    await page.getByLabel(/^Open Terminal here$/).click();

    await expect(
      page.locator(TASKBAR_ENTRY_SELECTOR).getByLabel(/^Terminal$/)
    ).toBeVisible();
  });
});

test.describe("has keyboard shortcuts", () => {
  test("ctrl + shift + r (open run dialog)", async ({ page }) => {
    await page.getByRole("main").press("Control+Shift+KeyR");

    await expect(
      page.locator(TASKBAR_ENTRY_SELECTOR).getByLabel(/^Run$/)
    ).toBeVisible();
  });

  test("ctrl + shift + e (open file explorer)", async ({ page }) => {
    await page.getByRole("main").press("Control+Shift+KeyE");

    await expect(
      page.locator(TASKBAR_ENTRY_SELECTOR).getByLabel(/^File Explorer$/)
    ).toBeVisible();
  });

  // TODO: Ctrl+Shift+D
  // TODO: Ctrl: ESCAPE, F10, F12
  // TODO: F11 (Fullscreen), Arrows
});
