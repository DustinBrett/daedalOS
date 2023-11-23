import { test } from "@playwright/test";
import {
  backgroundCanvasMaybeIsVisible,
  backgroundIsUrl,
  canvasBackgroundIsHidden,
  clickContextMenuEntry,
  clickDesktop,
  clickFileExplorerEntry,
  contextMenuIsVisible,
  desktopIsVisible,
  fileExplorerEntriesAreVisible,
  loadAppWithCanvas,
  mockPictureSlideshowRequest,
  windowsAreVisible,
} from "e2e/functions";

test("has background", loadAppWithCanvas);

test("can change background", async ({ headless, browserName, page }) => {
  await loadAppWithCanvas({ browserName, headless, page });

  const pictureSlideshowResponse = await mockPictureSlideshowRequest({ page });

  await clickDesktop({ page }, true);
  await contextMenuIsVisible({ page });
  await backgroundCanvasMaybeIsVisible({ browserName, headless, page });
  await clickContextMenuEntry(/^Background$/, { page });
  await clickContextMenuEntry(/^Picture Slideshow$/, { page });

  await pictureSlideshowResponse();

  await canvasBackgroundIsHidden({ page });
  await backgroundIsUrl({ page });

  await page.reload();

  await desktopIsVisible({ page });
  await backgroundIsUrl({ page });
  await canvasBackgroundIsHidden({ page });
});

test.describe("can set backgound", () => {
  test.beforeEach(async ({ page }) => page.goto("/?url=/System/Icons/48x48"));
  test.beforeEach(windowsAreVisible);
  test.beforeEach(fileExplorerEntriesAreVisible);
  test.beforeEach(backgroundCanvasMaybeIsVisible);

  test("via image", async ({ headless, browserName, page }) => {
    await backgroundCanvasMaybeIsVisible({ browserName, headless, page });

    await clickFileExplorerEntry("unknown.png", { page }, true);
    await contextMenuIsVisible({ page });

    await clickContextMenuEntry(/^Set as desktop background$/, { page });
    await clickContextMenuEntry(/^Fill$/, { page });

    await backgroundIsUrl({ page });
    await canvasBackgroundIsHidden({ page });
  });

  // TEST: from video
});
