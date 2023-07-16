import { expect, test } from "@playwright/test";

const WINDOW_SELECTOR = "main>.react-draggable>section";
const WINDOW_TITLEBAR_SELECTOR = "div>header";
const TASKBAR_SELECTOR = "main>nav";

const isMaximized = ([windowSelector, taskbarSelector]: string[]): boolean =>
  window.innerWidth ===
    (document.querySelector(windowSelector) as HTMLElement)?.clientWidth &&
  window.innerHeight -
    ((document.querySelector(taskbarSelector) as HTMLElement)?.clientHeight ||
      0) ===
    (document.querySelector(windowSelector) as HTMLElement)?.clientHeight;

test.describe("window", () => {
  test.beforeEach(async ({ page }) => page.goto("/?app=FileExplorer"));

  test("has title", async ({ page }) => {
    await expect(
      page.locator(`${WINDOW_SELECTOR}>${WINDOW_TITLEBAR_SELECTOR}`)
    ).toContainText(/^My PC$/);
  });

  test("has minimize", async ({ page }) => {
    const windowElement = page.locator(WINDOW_SELECTOR);

    await expect(windowElement).toHaveCSS("opacity", "1");

    await windowElement
      .locator(`${WINDOW_TITLEBAR_SELECTOR}>nav`)
      .getByLabel(/^Minimize$/)
      .click();

    await expect(windowElement).toHaveCSS("opacity", "0");
  });

  test.describe("has maximize", () => {
    test("on button", async ({ page }) => {
      await page
        .locator(`${WINDOW_TITLEBAR_SELECTOR}>nav`)
        .getByLabel(/^Maximize$/)
        .click();

      expect(
        await page.waitForFunction(isMaximized, [
          WINDOW_SELECTOR,
          TASKBAR_SELECTOR,
        ])
      ).toBeTruthy();
    });

    test("on double click", async ({ page }) => {
      await page.locator(WINDOW_TITLEBAR_SELECTOR).dblclick();

      expect(
        await page.waitForFunction(isMaximized, [
          WINDOW_SELECTOR,
          TASKBAR_SELECTOR,
        ])
      ).toBeTruthy();
    });
  });

  test.describe("has close", () => {
    test.beforeEach(async ({ page }) =>
      expect(page.locator(WINDOW_SELECTOR)).toBeVisible()
    );

    test("on button", async ({ page }) => {
      await page
        .locator(`${WINDOW_SELECTOR}>${WINDOW_TITLEBAR_SELECTOR}>nav`)
        .getByLabel(/^Close$/)
        .click();

      await expect(page.locator(WINDOW_SELECTOR)).toBeHidden();
    });

    // eslint-disable-next-line playwright/no-skipped-test
    test.skip("on double click", async ({ page }) => {
      await page
        .locator(`${WINDOW_SELECTOR}>${WINDOW_TITLEBAR_SELECTOR}>button`)
        .dblclick();

      await expect(page.locator(WINDOW_SELECTOR)).toBeHidden();
    });
  });
});
