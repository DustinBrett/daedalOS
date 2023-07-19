import { expect, test } from "@playwright/test";
import {
  DESKTOP_ELEMENT,
  TASKBAR_SELECTOR,
  WINDOW_SELECTOR,
  WINDOW_TITLEBAR_SELECTOR,
} from "e2e/constants";
import {
  isMaximized,
  waitForAnimation,
  windowIsHidden,
  windowTitlebarEqualsText,
  windowTitlebarIsVisible,
} from "e2e/functions";

test.beforeEach(async ({ page }) => {
  await page.goto("/?app=FileExplorer");

  await waitForAnimation(WINDOW_SELECTOR, { page });
  await windowTitlebarIsVisible({ page });
});

test("has title", async ({ page }) =>
  windowTitlebarEqualsText("My PC", { page }));

test("has minimize", async ({ page }) => {
  const windowElement = page.locator(WINDOW_SELECTOR);

  await expect(windowElement).toHaveCSS("opacity", "1");

  await page
    .locator(WINDOW_TITLEBAR_SELECTOR)
    .getByLabel(/^Minimize$/)
    .click();

  await expect(windowElement).toHaveCSS("opacity", "0");
});

test.describe("has maximize", () => {
  test("on click button", async ({ page }) => {
    await page
      .locator(WINDOW_TITLEBAR_SELECTOR)
      .getByLabel(/^Maximize$/)
      .click();

    expect(
      await page.waitForFunction(isMaximized, [
        WINDOW_SELECTOR,
        TASKBAR_SELECTOR,
      ])
    ).toBeTruthy();
  });

  test("on double click titlebar", async ({ page }) => {
    await page.locator(WINDOW_TITLEBAR_SELECTOR).dblclick();

    expect(
      await page.waitForFunction(isMaximized, [
        WINDOW_SELECTOR,
        TASKBAR_SELECTOR,
      ])
    ).toBeTruthy();
  });
});

test.describe("has close", () => {
  test("on click button", async ({ page }) => {
    await page
      .locator(WINDOW_TITLEBAR_SELECTOR)
      .getByLabel(/^Close$/)
      .click();

    await windowIsHidden({ page });
  });

  test("on double click icon", async ({ page }) => {
    await page
      .locator(`${WINDOW_TITLEBAR_SELECTOR}>button>figure>picture`)
      .dblclick();

    await windowIsHidden({ page });
  });
});

test("has drag", async ({ page }) => {
  const titlebarElement = page.locator(WINDOW_TITLEBAR_SELECTOR);
  const initialBoundingBox = await titlebarElement.boundingBox();

  await titlebarElement.dragTo(page.getByRole(DESKTOP_ELEMENT), {
    targetPosition: {
      x: (initialBoundingBox?.width || 0) / 2,
      y: (initialBoundingBox?.height || 0) / 2,
    },
  });

  const finalBoundingBox = await titlebarElement.boundingBox();

  expect(initialBoundingBox?.x).not.toEqual(finalBoundingBox?.x);
  expect(initialBoundingBox?.y).not.toEqual(finalBoundingBox?.y);

  const mainBoundingBox = await page.getByRole(DESKTOP_ELEMENT).boundingBox();

  expect(finalBoundingBox?.y).toEqual(mainBoundingBox?.y);
  expect(finalBoundingBox?.x).toEqual(mainBoundingBox?.x);
});

// TODO: has context menu
// TODO: has resize
// TODO: has keyboard shortcuts (Ctrl+Shift+Arrows & Ctrl+Alt+F4)
