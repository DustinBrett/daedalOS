import { expect, test } from "@playwright/test";
import {
  FILE_DRAG_NOT_WORKING_BROWSERS,
  FILE_ENTRIES_SELECTOR,
  TEST_APP_CONTAINER_APP,
  WINDOW_SELECTOR,
  WINDOW_TITLEBAR_SELECTOR,
} from "e2e/constants";

test.describe("app container", () => {
  test("has drop", async ({ browserName, page }) => {
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (FILE_DRAG_NOT_WORKING_BROWSERS.has(browserName)) {
      return;
    }

    await page.goto(`/?app=${TEST_APP_CONTAINER_APP}`);

    await expect(page.locator(WINDOW_TITLEBAR_SELECTOR)).toContainText(
      TEST_APP_CONTAINER_APP
    );

    const firstFile = page.locator(FILE_ENTRIES_SELECTOR).first();

    await expect(firstFile).toBeVisible();

    await firstFile.dragTo(page.locator(WINDOW_SELECTOR));

    await expect(page.locator(WINDOW_TITLEBAR_SELECTOR)).toContainText(
      `${(await firstFile.textContent()) || ""}.url - ${TEST_APP_CONTAINER_APP}`
    );
  });
});
