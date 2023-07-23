import { test } from "@playwright/test";
import {
  backgroundCanvasMaybeIsVisible,
  backgroundIsUrl,
  canvasBackgroundIsHidden,
  clickContextMenuEntry,
  clickDesktop,
  contextMenuIsVisible,
  desktopEntriesAreVisible,
  desktopIsVisible,
  loadApp,
  mockPictureSlideshowRequest,
} from "e2e/functions";

test.beforeEach(loadApp);
test.beforeEach(desktopEntriesAreVisible);

test("has background", backgroundCanvasMaybeIsVisible);

test("can change background", async ({ headless, browserName, page }) => {
  await backgroundCanvasMaybeIsVisible({ browserName, headless, page });

  await mockPictureSlideshowRequest({ page });

  await clickDesktop({ page }, true);
  await contextMenuIsVisible({ page });
  await clickContextMenuEntry(/^Background$/, { page });
  await clickContextMenuEntry(/^Picture Slideshow$/, { page });

  await canvasBackgroundIsHidden({ page });
  await backgroundIsUrl({ page });

  await page.reload();

  await desktopIsVisible({ page });
  await canvasBackgroundIsHidden({ page });
  await backgroundIsUrl({ page });
});

// TODO: can set backgound (image/video)
