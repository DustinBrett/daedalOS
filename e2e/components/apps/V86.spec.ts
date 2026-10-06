import { test } from "@playwright/test";
import {
  captureConsoleLogs,
  closePage,
  disableWallpaper,
  loadApp,
  windowsAreVisible,
  windowTitlebarTextIsVisible,
} from "e2e/functions";

const APP = "V86";
const DISK_IMAGE = "linux.bin";
const DISK_IMAGE_URL = `/System/${DISK_IMAGE}`;

test.beforeEach(captureConsoleLogs("apps"));
test.beforeEach(disableWallpaper);
test.afterEach(closePage);

test.describe("loads disk image", () => {
  for (const deviceMemory of [0.25, 8, 32]) {
    test(`with deviceMemory of ${deviceMemory} GB`, async ({ page }) => {
      await page.addInitScript((memory) => {
        Object.defineProperty(navigator, "deviceMemory", {
          configurable: true,
          get: () => memory,
        });
      }, deviceMemory);

      await loadApp({ app: APP, url: DISK_IMAGE_URL })({ page });
      await windowsAreVisible({ page });

      // Booting takes seconds in Firefox when the suite runs in parallel
      await windowTitlebarTextIsVisible(`Virtual x86 - ${DISK_IMAGE}`, {
        page,
      });
    });
  }
});
