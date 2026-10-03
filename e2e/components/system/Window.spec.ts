import { expect, test } from "@playwright/test";
import {
  DEFAULT_SESSION,
  DESKTOP_SELECTOR,
  TEST_APP,
  TEST_APP_TITLE_TEXT,
  WINDOW_SELECTOR,
} from "e2e/constants";
import {
  captureConsoleLogs,
  clickCloseWindow,
  clickMaximizeWindow,
  clickMinimizeWindow,
  disableWallpaper,
  doubleClickWindowTitlebar,
  doubleClickWindowTitlebarIcon,
  dragWindowToDesktop,
  fileExplorerEntriesAreVisible,
  loadApp,
  loadTestApp,
  pressDesktopKeys,
  triggerFullscreenDetection,
  windowAnimationIsFinished,
  windowIsHidden,
  windowIsMaximized,
  windowIsOpaque,
  windowIsTransparent,
  windowsAreVisible,
  windowTitlebarTextIsVisible,
} from "e2e/functions";

test.beforeEach(captureConsoleLogs());
test.beforeEach(disableWallpaper);
test.beforeEach(loadTestApp);
test.beforeEach(windowsAreVisible);
test.beforeEach(windowAnimationIsFinished);
test.beforeEach(fileExplorerEntriesAreVisible);

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

  test("stays on screen when the viewport shrinks", async ({ page }) => {
    const windowElement = page.locator(WINDOW_SELECTOR);
    const { x = 0, y = 0 } = (await windowElement.boundingBox()) || {};

    await clickMaximizeWindow({ page });
    await windowIsMaximized({ page });

    // Smaller than the restore position, which gets clamped while maximized
    await page.setViewportSize({ height: Math.floor(y), width: Math.floor(x) });

    await windowIsMaximized({ page });
    expect(await windowElement.boundingBox()).toMatchObject({ x: 0, y: 0 });
  });

  test("opens maximized when larger than the viewport", async ({ page }) => {
    await page.setViewportSize({ height: 300, width: 400 });
    await page.reload();

    await windowsAreVisible({ page });
    await windowIsMaximized({ page });
  });

  test("opens maximized from session", async ({ browser }) => {
    // Fresh page, as the loaded one has already persisted its own session
    const page = await browser.newPage();

    await disableWallpaper({ page });
    await loadApp(
      { app: TEST_APP },
      { ...DEFAULT_SESSION, windowStates: { [TEST_APP]: { maximized: true } } }
    )({ page });

    await windowsAreVisible({ page });
    await windowIsMaximized({ page });
    await page.close();
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

  test("via alt + f4 (in fullscreen)", async ({ browserName, page }) => {
    await triggerFullscreenDetection({ browserName, page });
    await pressDesktopKeys("Alt+F4", { page });
    await windowIsHidden({ page });
  });
});

test("can drag", async ({ page }) => {
  const windowElement = page.locator(WINDOW_SELECTOR);
  const initialBoundingBox = await windowElement.boundingBox();

  await expect(async () => {
    await dragWindowToDesktop({ page });

    const finalBoundingBox = await windowElement.boundingBox();

    expect(initialBoundingBox?.x).not.toEqual(finalBoundingBox?.x);
    expect(initialBoundingBox?.y).not.toEqual(finalBoundingBox?.y);

    const mainBoundingBox = await page.locator(DESKTOP_SELECTOR).boundingBox();

    expect(finalBoundingBox?.y).toEqual(mainBoundingBox?.y);
    expect(finalBoundingBox?.x).toEqual(mainBoundingBox?.x);
  }).toPass();
});

test("can resize", async ({ page }) => {
  const windowElement = page.locator(WINDOW_SELECTOR);
  const {
    height: initialHeight = 0,
    width: initialWidth = 0,
    x = 0,
    y = 0,
  } = (await windowElement.boundingBox()) || {};
  const RESIZE_OFFSET = 25;

  await page.mouse.move(x, y);
  await page.mouse.down({ button: "left" });
  await page.mouse.move(x + RESIZE_OFFSET, y + RESIZE_OFFSET);

  const { height: finalHeight = 0, width: finalWidth = 0 } =
    (await windowElement.boundingBox()) || {};

  expect(finalWidth).toEqual(initialWidth - RESIZE_OFFSET);
  expect(finalHeight).toEqual(initialHeight - RESIZE_OFFSET);
});
