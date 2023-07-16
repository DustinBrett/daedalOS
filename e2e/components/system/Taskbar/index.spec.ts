import { expect, test } from "@playwright/test";

const TASKBAR_ENTRIES_SELECTOR = "main>nav>ol>li";

const TEST_APP = "FileExplorer";
const TEST_APP_TITLE = /^My PC$/;
const TEST_APP_ICON = /\/pc\.(webp|png)$/;

const CLOCK_REGEX = /^(1[0-2]|0?[1-9])(?::[0-5]\d){2}\s?(AM|PM)$/;

const OFFSCREEN_CANVAS_NOT_SUPPORTED_BROWSERS = new Set(["webkit"]);

test.describe("taskbar", () => {
  test.describe("elements", () => {
    test.beforeEach(async ({ page }) => page.goto("/"));

    test("has start button", async ({ page }) => {
      await expect(page.getByLabel(/^Start$/)).toBeVisible();
    });

    test.describe("has clock", () => {
      test("via canvas", async ({ browserName, page }) => {
        const noCanvasSupport =
          OFFSCREEN_CANVAS_NOT_SUPPORTED_BROWSERS.has(browserName);
        const clock = page.getByLabel(/^Clock$/);

        await expect(clock).toContainText(noCanvasSupport ? CLOCK_REGEX : "");
        await expect(clock.locator("canvas"))[
          noCanvasSupport ? "toBeHidden" : "toBeVisible"
        ]();
      });

      test("via text", async ({ page }) => {
        await page.addInitScript(() => {
          delete (window as Partial<Window & typeof globalThis>)
            .OffscreenCanvas;
        });

        await page.reload();

        await expect(page.getByLabel(/^Clock$/)).toContainText(CLOCK_REGEX);
      });
    });

    test("has calendar", async ({ page }) => {
      await page.getByLabel(/^Clock$/).click();

      await expect(page.getByLabel(/^Calendar$/)).toBeVisible();
    });
  });

  test.describe("entries", () => {
    test.beforeEach(async ({ page }) => page.goto(`/?app=${TEST_APP}`));

    test("has entry", async ({ page }) => {
      const entries = page.locator(TASKBAR_ENTRIES_SELECTOR);

      await expect(entries).toBeVisible();

      const entry = entries.getByLabel(TEST_APP_TITLE);

      await expect(entry).toBeVisible();
      await expect(entry.locator("img")).toHaveAttribute("src", TEST_APP_ICON);
    });
  });
});
