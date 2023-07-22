import { test } from "@playwright/test";
import { BASE_APP_FAVICON_TEXT } from "e2e/constants";
import {
  backgroundIsUrl,
  canvasBackgroundIsHidden,
  canvasBackgroundIsVisible,
  clickContextMenuEntry,
  clickDesktop,
  contextMenuIsVisible,
  desktopEntriesAreVisible,
  desktopIsVisible,
  loadApp,
} from "e2e/functions";

test.beforeEach(loadApp);
test.beforeEach(desktopEntriesAreVisible);

test("has background", canvasBackgroundIsVisible);

test("can change background", async ({ context, page }) => {
  await canvasBackgroundIsVisible({ page });

  await context.route("/Users/Public/Pictures/slideshow.json", (route) =>
    route.fulfill({ body: JSON.stringify([BASE_APP_FAVICON_TEXT]) })
  );

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
