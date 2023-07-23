import { test } from "@playwright/test";
import { BASE_APP_FAVICON_TEXT } from "e2e/constants";
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
} from "e2e/functions";

test.beforeEach(loadApp);
test.beforeEach(desktopEntriesAreVisible);

test("has background", backgroundCanvasMaybeIsVisible);

test("can change background", async ({
  headless,
  browserName,
  context,
  page,
}) => {
  await backgroundCanvasMaybeIsVisible({ browserName, headless, page });

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
