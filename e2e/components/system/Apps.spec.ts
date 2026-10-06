import { test } from "@playwright/test";
import {
  DESKTOP_ENTRIES_SELECTOR,
  DRAG_HEADLESS_NOT_SUPPORTED_BROWSERS,
  TEST_APP_CONTAINER_APP,
  TEST_APP_CONTAINER_APP_TITLE,
} from "e2e/constants";
import {
  captureConsoleLogs,
  closePage,
  desktopEntriesAreVisible,
  disableWallpaper,
  dragFirstDesktopEntryToWindow,
  loadContainerTestApp,
  windowsAreVisible,
  windowTitlebarTextIsVisible,
} from "e2e/functions";

test.beforeEach(captureConsoleLogs());
test.beforeEach(disableWallpaper);
test.afterEach(closePage);

test.describe("app container", () => {
  test.beforeEach(loadContainerTestApp);
  test.beforeEach(windowsAreVisible);

  test("can drop", async ({ browserName, headless, page }) => {
    test.skip(
      headless && DRAG_HEADLESS_NOT_SUPPORTED_BROWSERS.has(browserName),
      "no headless drag support"
    );

    await windowTitlebarTextIsVisible(TEST_APP_CONTAINER_APP, { page });

    await desktopEntriesAreVisible({ page });
    await dragFirstDesktopEntryToWindow({ page });

    await windowTitlebarTextIsVisible(
      TEST_APP_CONTAINER_APP_TITLE(
        await page.locator(DESKTOP_ENTRIES_SELECTOR).first().textContent()
      ),
      { page }
    );
  });
});
