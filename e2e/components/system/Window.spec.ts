import { expect, test } from "@playwright/test";
import {
  DESKTOP_SELECTOR,
  TEST_APP_TITLE_TEXT,
  WINDOW_SELECTOR,
} from "e2e/constants";
import {
  clickCloseWindow,
  clickMaximizeWindow,
  clickMinimizeWindow,
  disableWallpaper,
  doubleClickWindowTitlebar,
  doubleClickWindowTitlebarIcon,
  dragWindowToDesktop,
  loadTestApp,
  pressDesktopKeys,
  windowAnimationIsFinished,
  windowIsHidden,
  windowIsMaximized,
  windowIsOpaque,
  windowIsTransparent,
  windowTitlebarTextIsVisible,
  windowsAreVisible,
} from "e2e/functions";

test.beforeEach(disableWallpaper);
test.beforeEach(loadTestApp);
test.beforeEach(windowsAreVisible);
test.beforeEach(windowAnimationIsFinished);

test("has title", async ({ page }) =>
  windowTitlebarTextIsVisible(TEST_APP_TITLE_TEXT, { page }));

test("can minimize", async ({ page }) => {
  await windowIsOpaque({ page });
  await clickMinimizeWindow({ page });
  await windowIsTransparent({ page });
});

test.describe("can maximize", () => {
  test("via click button", async ({ page }) => {
    await clickMaximizeWindow({ page });
    await windowIsMaximized({ page });
  });

  test("via double click titlebar", async ({ page }) => {
    await doubleClickWindowTitlebar({ page });
    await windowIsMaximized({ page });
  });
});

test.describe("can close", () => {
  test("via click button", async ({ page }) => {
    await clickCloseWindow({ page });
    await windowIsHidden({ page });
  });

  test("via double click icon", async ({ page }) => {
    await doubleClickWindowTitlebarIcon({ page });
    await windowIsHidden({ page });
  });

  test("via ctrl + alt + f4", async ({ page }) => {
    await pressDesktopKeys("Control+Alt+F4", { page });
    await windowIsHidden({ page });
  });

  // P2: has close on alt + f4 in fullscreen
});

test("can drag", async ({ page }) => {
  const windowElement = page.locator(WINDOW_SELECTOR);
  const initialBoundingBox = await windowElement.boundingBox();

  await dragWindowToDesktop({ page });

  const finalBoundingBox = await windowElement.boundingBox();

  expect(initialBoundingBox?.x).not.toEqual(finalBoundingBox?.x);
  expect(initialBoundingBox?.y).not.toEqual(finalBoundingBox?.y);

  const mainBoundingBox = await page.locator(DESKTOP_SELECTOR).boundingBox();

  expect(finalBoundingBox?.y).toEqual(mainBoundingBox?.y);
  expect(finalBoundingBox?.x).toEqual(mainBoundingBox?.x);
});

// P0: move on viewport shrink

test("can resize", async ({ page }) => {
  const windowElement = page.locator(WINDOW_SELECTOR);
  const {
    x = 0,
    y = 0,
    width: initialWidth = 0,
    height: initialHeight = 0,
  } = (await windowElement.boundingBox()) || {};
  const RESIZE_OFFSET = 25;

  await page.mouse.move(x, y);
  await page.mouse.down({ button: "left" });
  await page.mouse.move(x + RESIZE_OFFSET, y + RESIZE_OFFSET);

  const { width: finalWidth = 0, height: finalHeight = 0 } =
    (await windowElement.boundingBox()) || {};

  expect(finalWidth).toEqual(initialWidth - RESIZE_OFFSET);
  expect(finalHeight).toEqual(initialHeight - RESIZE_OFFSET);
});

// P0: has context menu
// P0: has keyboard shortcuts (Ctrl+Shift+Arrows)
// P0: focus/blur
// P0: foreground/background
