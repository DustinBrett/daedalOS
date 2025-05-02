import { test } from "@playwright/test";
import directory from "contexts/process/directory";
import { TEST_APP_URL } from "e2e/constants";
import {
  captureConsoleLogs,
  disableWallpaper,
  loadApp,
  taskbarEntriesAreVisible,
  windowsAreVisible,
} from "e2e/functions";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";

test.beforeEach(captureConsoleLogs("apps"));
test.beforeEach(disableWallpaper);

test.describe("can open app", () => {
  const apps = Object.entries(directory).filter(
    ([, { dialogProcess }]) => !dialogProcess
  );

  for (const [app, { hasWindow, hideTaskbarEntry }] of apps) {
    // eslint-disable-next-line playwright/valid-title
    test(app, async ({ page }) => {
      test.fail(
        !hasWindow && Boolean(hideTaskbarEntry),
        "no app elements visible"
      );

      const queryParams: Record<string, string> = { app };
      const url = TEST_APP_URL[app];

      if (url) queryParams.url = url;

      await loadApp(queryParams)({ page });

      // NOTE: Some apps fully load AFTER the window has transitioned
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(TRANSITIONS_IN_MILLISECONDS.WINDOW * 2);

      if (hasWindow) await windowsAreVisible({ page });
      if (!hideTaskbarEntry) await taskbarEntriesAreVisible({ page });
    });
  }
});
