import { test } from "@playwright/test";
import {
  DESKTOP_FILE_ENTRY_SELECTOR,
  FILE_DRAG_NOT_WORKING_BROWSERS,
  FORCE,
  TEST_APP_CONTAINER_APP,
  WINDOW_SELECTOR,
} from "e2e/constants";
import {
  desktopFileEntriesAreVisible,
  windowIsVisible,
  windowTitlebarEqualsText,
  windowTitlebarIsVisible,
} from "e2e/functions";

test.describe("app container", () => {
  test("has drop", async ({ browserName, page }) => {
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (FILE_DRAG_NOT_WORKING_BROWSERS.has(browserName)) {
      return;
    }

    await page.goto(`/?app=${TEST_APP_CONTAINER_APP}`);

    await windowIsVisible({ page });

    await windowTitlebarIsVisible({ page });

    await windowTitlebarEqualsText(TEST_APP_CONTAINER_APP, { page });

    await desktopFileEntriesAreVisible({ page });

    const firstFile = page.locator(DESKTOP_FILE_ENTRY_SELECTOR).first();

    await firstFile.dragTo(page.locator(WINDOW_SELECTOR), FORCE);

    await windowTitlebarEqualsText(
      `${
        (await firstFile.textContent()) || ""
      }.url - ${TEST_APP_CONTAINER_APP}`,
      { page }
    );
  });

  // TODO: has loading
});

// TODO: iframe app -> loads url (Browser, IRC, Paint)
