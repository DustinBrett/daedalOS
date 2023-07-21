import { test } from "@playwright/test";
import {
  backgroundIsUrl,
  canvasBackgroundIsHidden,
  canvasBackgroundIsVisible,
  clickContextMenuEntry,
  clickDesktop,
  contextMenuIsVisible,
  desktopIsVisible,
  loadApp,
} from "e2e/functions";

test.beforeEach(loadApp);
test.beforeEach(desktopIsVisible);

test("has background", canvasBackgroundIsVisible);

test("can change background", async ({ page }) => {
  await canvasBackgroundIsVisible({ page });

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
