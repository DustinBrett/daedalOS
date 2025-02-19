import { test } from "@playwright/test";
import directory from "contexts/process/directory";
import {
  captureConsoleLogs,
  disableWallpaper,
  loadApp,
  taskbarEntriesAreVisible,
  windowsAreVisible,
} from "e2e/functions";

test.beforeEach(captureConsoleLogs);
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

      await loadApp({ page }, { app });

      if (hasWindow) await windowsAreVisible({ page });
      if (!hideTaskbarEntry) await taskbarEntriesAreVisible({ page });
    });
  }
});
