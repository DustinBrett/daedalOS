import type { Locator } from "@playwright/test";
import { expect, test } from "@playwright/test";

const RIGHT_CLICK = { button: "right" } as Parameters<Locator["click"]>[0];

const BACKGROUND_CANVAS_SELECTOR = "main>canvas";
const FIRST_FILE_ENTRY_SELECTOR = "main>ol>li:first-child";
const CONTEXT_MENU_SELECTOR = "#__next>nav";

const SCREEN_CAPTURE_NOT_SUPPORTED_BROWSERS = new Set(["webkit"]);
const DIRECTORY_PICKER_NOT_SUPPORTED_BROWSERS = new Set(["webkit", "firefox"]);

const MENU_ITEMS = [
  [/^Sort by$/, true],
  [/^Refresh$/, true],
  [/^Background$/, true],
  [/^Add file\(s\)$/, true],
  [/^Open Terminal here$/, true],
  [/^Paste$/, true],
  [/^New$/, true],
  [/^View page source$/, true],
  [/^Inspect$/, true],
  [/^Properties$/, false],
];

test.describe("desktop", () => {
  test.beforeEach(async ({ page }) => page.goto("/"));

  test("has background", async ({ page }) => {
    await expect(page.locator(BACKGROUND_CANVAS_SELECTOR)).toBeVisible();
  });

  test("has file entry", async ({ page }) => {
    await expect(page.locator(FIRST_FILE_ENTRY_SELECTOR)).toBeVisible();
  });

  test.describe("has context menu", () => {
    test.beforeEach(async ({ page }) => {
      await page.locator("main").click(RIGHT_CLICK);
    });

    test("with items", async ({ browserName, page }) => {
      const ALL_MENU_ITEMS = [
        ...MENU_ITEMS,
        [
          /^Capture screen$/,
          !SCREEN_CAPTURE_NOT_SUPPORTED_BROWSERS.has(browserName),
        ],
        [
          /^Map directory$/,
          !DIRECTORY_PICKER_NOT_SUPPORTED_BROWSERS.has(browserName),
        ],
      ];
      const menuItems = page.locator(CONTEXT_MENU_SELECTOR);

      for (const [label, shown] of ALL_MENU_ITEMS) {
        // eslint-disable-next-line no-await-in-loop
        await expect(menuItems.getByLabel(label as RegExp))[
          shown ? "toBeVisible" : "toBeHidden"
        ]();
      }
    });

    test("can change background", async ({ page }) => {
      await page.getByLabel(/^Background$/).click();
      await page.getByLabel(/^APOD$/).click();

      await expect(page.locator(BACKGROUND_CANVAS_SELECTOR)).toBeHidden();
    });

    test("can create folder", async ({ page }) => {
      await page.getByLabel(/^New$/).click();
      await page.getByLabel(/^Folder$/).click();

      await page.locator("main").click();

      await expect(page.getByLabel(/^New folder$/)).toBeVisible();
    });

    test("can create file", async ({ page }) => {
      await page.getByLabel(/^New$/).click();
      await page.getByLabel(/^Text Document$/).click();

      await page.locator("main").click();

      await expect(page.getByLabel(/^New Text Document.txt$/)).toBeVisible();
    });
  });
});
