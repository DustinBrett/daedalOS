import { expect, type Page, test } from "@playwright/test";
import {
  CALENDAR_LABEL,
  CLOCK_LABEL,
  CONTEXT_MENU_ENTRIES_SELECTOR,
  CONTEXT_MENU_SELECTOR,
  DESKTOP_ENTRIES_SELECTOR,
  DESKTOP_SELECTOR,
  FILE_EXPLORER_ADDRESS_BAR_LABEL,
  FILE_EXPLORER_ENTRIES_FOCUSED_SELECTOR,
  FILE_EXPLORER_ENTRIES_RENAMING_SELECTOR,
  FILE_EXPLORER_ENTRIES_SELECTOR,
  FILE_EXPLORER_SEARCH_BOX_SELECTOR,
  FILE_EXPLORER_SELECTOR,
  FILE_EXPLORER_STATUS_BAR_SELECTOR,
  RIGHT_CLICK,
  SEARCH_BUTTON_SELECTOR,
  SEARCH_MENU_INPUT_SELECTOR,
  SEARCH_MENU_SELECTOR,
  START_BUTTON_SELECTOR,
  START_MENU_SELECTOR,
  TASKBAR_ENTRIES_SELECTOR,
  TASKBAR_SELECTOR,
  TEST_ROOT_FILE,
  WINDOW_SELECTOR,
  WINDOW_TITLEBAR_SELECTOR,
} from "e2e/constants";
import {
  captureConsoleLogs,
  clickContextMenuEntry,
  clickDesktop,
  clickFileExplorerEntry,
  closePage,
  contextMenuEntryIsVisible,
  contextMenuIsHidden,
  contextMenuIsVisible,
  desktopEntriesAreVisible,
  disableWallpaper,
  fileExplorerEntriesAreVisible,
  fileExplorerRenameEntry,
  loadApp,
  loadTestApp,
  scanPasses,
  searchMenuIsHidden,
  searchMenuIsVisible,
  startMenuIsHidden,
  startMenuIsVisible,
  taskbarIsVisible,
  windowAnimationIsFinished,
  windowIsHidden,
  windowsAreVisible,
} from "e2e/functions";

const MENU_ITEM_SELECTOR = `${CONTEXT_MENU_ENTRIES_SELECTOR}>[role^=menuitem]`;
const DESKTOP_BUTTON_SELECTOR = `${DESKTOP_ENTRIES_SELECTOR}>button`;
const FILE_BUTTON_SELECTOR = `${FILE_EXPLORER_ENTRIES_SELECTOR}>button`;
const SELECTED_FILE_BUTTON_SELECTOR = `${FILE_EXPLORER_ENTRIES_FOCUSED_SELECTOR}>button`;

// Tab moves on until focus is back where it started, never leaving `within`
const tabsAround = async (
  page: Page,
  within: string,
  maxTabs: number
): Promise<void> => {
  // A window can take focus a moment after it shows
  await expect(page.locator(`${within} :focus`)).toHaveCount(1);
  await page.keyboard.press("Tab");

  const firstFocused = await page.evaluateHandle(() => document.activeElement);
  let tabs = 0;
  let cameAround = false;

  /* eslint-disable no-await-in-loop */
  while (tabs < maxTabs && !cameAround) {
    await page.keyboard.press("Tab");
    await expect(page.locator(`${within} :focus`)).toHaveCount(1);
    cameAround = await page.evaluate(
      (element) => document.activeElement === element,
      firstFocused
    );
    tabs += 1;
  }
  /* eslint-enable no-await-in-loop */

  expect(cameAround).toBe(true);
  expect(tabs).toBeGreaterThan(1);
};

test.beforeEach(captureConsoleLogs());
test.beforeEach(disableWallpaper);
test.afterEach(closePage);

test.describe("desktop", () => {
  test.beforeEach(loadApp());
  test.beforeEach(desktopEntriesAreVisible);
  test.beforeEach(taskbarIsVisible);

  test("focus visuals only show while navigating with the keyboard", async ({
    page,
  }) => {
    const entries = page.locator(DESKTOP_BUTTON_SELECTOR);

    await entries.nth(1).click();
    await expect(entries.nth(1)).toBeFocused();

    // Selection already shows where focus is, as it does in Windows
    await page.keyboard.press("ArrowUp");
    await expect(entries.first()).toBeFocused();
    await expect(entries.first()).toHaveCSS("outline-style", "none");

    await page.keyboard.press("Control+ArrowDown");
    await expect(entries.nth(1)).toBeFocused();
    await expect(entries.nth(1)).toHaveCSS("outline-style", "solid");
    await expect(entries.nth(1)).toHaveCSS("outline-width", "2px");

    // An entry that isn't selected shows whether a click hid focus visuals
    await entries.first().click();
    await entries.nth(1).focus();
    await expect(entries.nth(1)).toHaveCSS("outline-style", "none");
  });

  test("context menu opens from the keyboard and returns focus", async ({
    page,
  }) => {
    const entry = page.locator(DESKTOP_BUTTON_SELECTOR).first();
    const menu = page.locator(CONTEXT_MENU_SELECTOR);

    await entry.focus();
    await page.keyboard.press("Shift+F10");
    await contextMenuIsVisible({ page });
    await expect(menu).toHaveAttribute("role", "menu");
    await expect(menu).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await expect(page.locator(MENU_ITEM_SELECTOR).first()).toBeFocused();

    await page.keyboard.press("End");
    await expect(page.locator(MENU_ITEM_SELECTOR).last()).toBeFocused();

    await page.keyboard.press("Escape");
    await contextMenuIsHidden({ page });
    await expect(entry).toBeFocused();
  });

  test("menus are navigable with arrow keys", async ({ page }) => {
    await clickDesktop({ page }, true);
    await contextMenuIsVisible({ page });

    await page.keyboard.press("ArrowDown");

    const firstItem = page.locator(MENU_ITEM_SELECTOR).first();

    await expect(firstItem).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(firstItem).toBeFocused();

    const subMenuParent = page
      .locator(`${MENU_ITEM_SELECTOR}[aria-haspopup=menu]`)
      .first();

    await subMenuParent.focus();
    await page.keyboard.press("ArrowRight");
    await expect(subMenuParent).toHaveAttribute("aria-expanded", "true");
    await expect(
      page
        .locator(
          `${CONTEXT_MENU_ENTRIES_SELECTOR} [role=menu] [role^=menuitem]`
        )
        .first()
    ).toBeFocused();

    await scanPasses(page, CONTEXT_MENU_SELECTOR);

    await page.keyboard.press("Escape");
    await expect(subMenuParent).toBeFocused();
    await expect(subMenuParent).toHaveAttribute("aria-expanded", "false");
    await contextMenuIsVisible({ page });

    await page.keyboard.press("Escape");
    await contextMenuIsHidden({ page });
  });

  test("taskbar buttons are navigable with arrow keys", async ({ page }) => {
    await page.locator(START_BUTTON_SELECTOR).focus();

    await page.keyboard.press("ArrowRight");
    await expect(page.locator(SEARCH_BUTTON_SELECTOR)).toBeFocused();

    await page.keyboard.press("Home");
    await expect(page.locator(START_BUTTON_SELECTOR)).toBeFocused();
  });

  test("start menu is navigable with the keyboard", async ({ page }) => {
    const startButton = page.locator(START_BUTTON_SELECTOR);
    const entries = page.locator(`${START_MENU_SELECTOR}>ol>li>button`);

    await startButton.focus();
    await page.keyboard.press("Enter");
    await startMenuIsVisible({ page });
    await expect(entries.first()).toBeVisible();
    await expect(page.locator(START_MENU_SELECTOR)).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await expect(
      page.locator(`${START_MENU_SELECTOR}>ol>li>button:focus`)
    ).toHaveCount(1);

    // Entries can still be loading, so keys are repeated until it settles
    await expect(async () => {
      await page.keyboard.press("Home");
      await expect(entries.first()).toBeFocused({ timeout: 500 });
    }).toPass();
    await expect(async () => {
      await page.keyboard.press("End");
      await expect(entries.last()).toBeFocused({ timeout: 500 });
    }).toPass();

    await page.keyboard.press("Escape");
    await startMenuIsHidden({ page });
    await expect(startButton).toBeFocused();
  });

  test("typing in a just opened start menu searches", async ({ page }) => {
    const appsWithV = page.locator(
      `${START_MENU_SELECTOR}>ol>li>button[aria-label^="V"]`
    );

    await page.locator(START_BUTTON_SELECTOR).focus();
    // Arrow keys are what turn on keyboard navigation
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Enter");
    await expect(appsWithV.first()).toBeVisible();

    // Even a letter that apps start with
    await page.keyboard.press("v");
    await searchMenuIsVisible({ page });
    await expect(page.locator(SEARCH_MENU_INPUT_SELECTOR)).toHaveValue("v");
  });

  test("search suggestions are reachable with arrow keys", async ({ page }) => {
    const searchButton = page.locator(SEARCH_BUTTON_SELECTOR);
    const input = page.locator(SEARCH_MENU_INPUT_SELECTOR);

    await searchButton.focus();
    await page.keyboard.press("Enter");
    await searchMenuIsVisible({ page });
    await expect(input).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await expect(
      page.locator(`${SEARCH_MENU_SELECTOR} section li>button`).first()
    ).toBeFocused();

    await page.keyboard.press("ArrowUp");
    await expect(input).toBeFocused();

    await page.keyboard.press("Escape");
    await searchMenuIsHidden({ page });
    await expect(searchButton).toBeFocused();
  });

  test("calendar changes month and closes from the keyboard", async ({
    page,
  }) => {
    const clock = page.locator(TASKBAR_SELECTOR).getByLabel(CLOCK_LABEL);
    const calendar = page.locator(DESKTOP_SELECTOR).getByLabel(CALENDAR_LABEL);

    await clock.focus();
    await page.keyboard.press("Enter");
    await expect(calendar).toBeVisible();

    const month = await calendar.locator("header").textContent();

    await page.keyboard.press("PageDown");
    await expect(calendar.locator("header")).not.toHaveText(month || "");

    await page.keyboard.press("Escape");
    await expect(calendar).toBeHidden();
    await expect(clock).toBeFocused();
  });

  test("Tab goes around the desktop and taskbar only", async ({ page }) => {
    const firstEntry = page.locator(DESKTOP_BUTTON_SELECTOR).first();

    await firstEntry.focus();
    await page.keyboard.press("Shift+Tab");
    await expect(page.locator(`${TASKBAR_SELECTOR} :focus`)).toHaveCount(1);

    await page.keyboard.press("Tab");
    await expect(firstEntry).toBeFocused();
  });

  test("dialogs keep Tab inside and return focus when closed", async ({
    page,
  }) => {
    const entry = page.locator(DESKTOP_BUTTON_SELECTOR).first();

    await entry.focus();
    await page.keyboard.press("Control+Shift+KeyR");
    await windowsAreVisible({ page });
    await windowAnimationIsFinished({ page });

    // Like Windows dialogs, never on the title bar's buttons
    await tabsAround(page, `${WINDOW_SELECTOR}>div>:not(header)`, 10);

    await page.keyboard.press("Escape");
    await windowIsHidden({ page });
    await expect(entry).toBeFocused();
  });

  test("clicking an item of a keyboard menu returns focus", async ({
    page,
  }) => {
    const entry = page.locator(DESKTOP_BUTTON_SELECTOR).first();

    await entry.focus();
    await page.keyboard.press("Shift+F10");
    await contextMenuIsVisible({ page });
    await clickContextMenuEntry(/^Copy$/, { page });
    await contextMenuIsHidden({ page });
    await expect(entry).toBeFocused();
  });

  test("Escape closing a dialog keeps full screen", async ({
    browserName,
    page,
  }) => {
    test.skip(
      browserName !== "chromium",
      "no keyboard lock to keep Escape in full screen"
    );

    const taskbar = page.locator(TASKBAR_ENTRIES_SELECTOR);

    await taskbar.click(RIGHT_CLICK);
    await clickContextMenuEntry(/^Enter full screen$/, { page });
    await expect
      .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
      .toBe(true);

    await page.keyboard.press("Control+Shift+KeyR");
    await expect(page.locator(`${WINDOW_SELECTOR} :focus`)).toHaveCount(1);
    await page.keyboard.press("Escape");
    await windowIsHidden({ page });

    await taskbar.click(RIGHT_CLICK);
    await contextMenuEntryIsVisible(/^Exit full screen$/, { page });
    expect(await page.evaluate(() => Boolean(document.fullscreenElement))).toBe(
      true
    );
  });
});

test.describe("windows", () => {
  test.beforeEach(loadTestApp);
  test.beforeEach(windowsAreVisible);
  test.beforeEach(windowAnimationIsFinished);
  test.beforeEach(fileExplorerEntriesAreVisible);

  test("window menu opens from the keyboard", async ({ page }) => {
    const menu = page.locator(CONTEXT_MENU_SELECTOR);
    const fileList = page.locator(FILE_EXPLORER_SELECTOR);

    await fileList.focus();
    await page.keyboard.press("Control+Alt+Space");
    await contextMenuIsVisible({ page });
    await expect(menu).toHaveAttribute("aria-label", "System");
    // Like other keyboard menus, nothing is selected until an arrow key
    await expect(menu).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(menu.getByLabel(/^Restore$/)).toBeFocused();

    await page.keyboard.press("Escape");
    await contextMenuIsHidden({ page });
    await expect(fileList).toBeFocused();
  });

  test("Tab stays inside the active window", async ({ page }) => {
    await page.locator(FILE_EXPLORER_SELECTOR).focus();
    await tabsAround(page, WINDOW_SELECTOR, 60);

    // From a button Tab skips, it would leave the window if not caught
    await page.locator(`${WINDOW_TITLEBAR_SELECTOR}>button`).first().focus();
    await page.keyboard.press("Shift+Tab");
    await expect(page.locator(`${WINDOW_SELECTOR} :focus`)).toHaveCount(1);
  });

  test("renaming ends without taking focus from what was clicked", async ({
    page,
  }) => {
    const search = page.locator(FILE_EXPLORER_SEARCH_BOX_SELECTOR);

    await page.locator(FILE_BUTTON_SELECTOR).first().click();
    await page.keyboard.press("F2");
    await expect(
      page.locator(FILE_EXPLORER_ENTRIES_RENAMING_SELECTOR)
    ).toBeFocused();
    await search.click();
    await page.keyboard.type("abc");
    await expect(search).toBeFocused();
    await expect(search).toHaveValue("abc");
  });

  test("pasted entries end up selected", async ({ page }) => {
    const entries = page.locator(FILE_BUTTON_SELECTOR);
    const selected = page.locator(SELECTED_FILE_BUTTON_SELECTOR);
    const count = await entries.count();

    await entries.last().click();
    await page.keyboard.press("Control+KeyC");
    await page.keyboard.press("Control+KeyV");
    await expect(entries).toHaveCount(count + 1);
    await expect(selected).toHaveCount(1);
    await expect(selected).toHaveAttribute("aria-label", / \(1\)/);
  });

  test("pasting a cut entry where it already is changes nothing", async ({
    page,
  }) => {
    const entries = page.locator(FILE_BUTTON_SELECTOR);
    const cutIcon = entries.last().locator("img").first();
    const count = await entries.count();

    await entries.last().click();
    await page.keyboard.press("Control+KeyX");
    await expect(cutIcon).toHaveCSS("opacity", "0.5");
    await page.keyboard.press("Control+KeyV");
    await expect(cutIcon).toHaveCSS("opacity", "1");
    await expect(entries).toHaveCount(count);

    // Nothing unseen is left selected, which Delete would remove too
    await expect(
      page
        .locator(FILE_EXPLORER_STATUS_BAR_SELECTOR)
        .getByLabel(/^Selected item count and size$/)
    ).toHaveCount(0);
  });

  test("file selection follows the Windows keys", async ({ page }) => {
    const entries = page.locator(FILE_BUTTON_SELECTOR);
    const selected = page.locator(FILE_EXPLORER_ENTRIES_FOCUSED_SELECTOR);

    await entries.first().click();
    await expect(selected).toHaveCount(1);

    await page.keyboard.press("Shift+ArrowRight");
    await expect(selected).toHaveCount(2);
    await expect(entries.nth(1)).toBeFocused();
    // Among several selected, only focus shows which one keys act on
    await expect(entries.nth(1)).toHaveCSS("outline-style", "solid");

    await page.keyboard.press("Control+ArrowRight");
    await expect(entries.nth(2)).toBeFocused();
    await expect(selected).toHaveCount(2);

    await page.keyboard.press("Control+Space");
    await expect(selected).toHaveCount(3);

    await page.keyboard.press("Home");
    await expect(entries.first()).toBeFocused();
    await expect(selected).toHaveCount(1);
  });

  test("a menu opened by the mouse captures keys", async ({ page }) => {
    const address = page.getByLabel(FILE_EXPLORER_ADDRESS_BAR_LABEL);
    const entries = page.locator(FILE_BUTTON_SELECTOR);
    const count = await entries.count();
    const url = await address.inputValue();

    await entries.first().click(RIGHT_CLICK);
    await contextMenuIsVisible({ page });

    await page.keyboard.press("Delete");
    await contextMenuIsVisible({ page });
    await expect(entries).toHaveCount(count);

    await page.keyboard.press("Enter");
    await contextMenuIsHidden({ page });
    await expect(page.locator(WINDOW_SELECTOR)).toHaveCount(1);
    await expect(address).toHaveValue(url);
    await expect(entries).toHaveCount(count);
  });

  test("keys on the window act on its items", async ({ page }) => {
    await page.locator(WINDOW_TITLEBAR_SELECTOR).click();
    await expect(page.locator(WINDOW_SELECTOR)).toBeFocused();
    await page.evaluate(() =>
      window.addEventListener("keydown", (event) => {
        if (event.key === "F5") {
          document.documentElement.dataset.refreshed = String(
            event.defaultPrevented
          );
        }
      })
    );

    // The folder refreshes, but not the page
    await page.keyboard.press("F5");
    await expect(page.locator("html")).toHaveAttribute(
      "data-refreshed",
      "true"
    );
    await fileExplorerEntriesAreVisible({ page });

    await page.keyboard.press("Shift+F10");
    await contextMenuIsVisible({ page });
    await contextMenuEntryIsVisible(/^Refresh$/, { page });
  });

  test("F2 renames the focused entry of a selection", async ({ page }) => {
    const entries = page.locator(FILE_BUTTON_SELECTOR);

    await entries.first().click();
    await entries.nth(1).click({ modifiers: ["Control"] });
    await page.keyboard.press("Control+ArrowLeft");
    await expect(entries.first()).toBeFocused();

    await page.keyboard.press("F2");
    await expect(entries.first().locator("textarea")).toBeFocused();
  });

  test("a renamed entry stays focused and selected", async ({ page }) => {
    const selected = page.locator(SELECTED_FILE_BUTTON_SELECTOR);

    await clickFileExplorerEntry(TEST_ROOT_FILE, { page });
    await page.keyboard.press("F2");
    await expect(
      page.locator(FILE_EXPLORER_ENTRIES_RENAMING_SELECTOR)
    ).toBeFocused();
    await fileExplorerRenameEntry("renamed", { page });

    await expect(selected).toHaveCount(1);
    await expect(selected).toHaveAttribute("aria-label", /^renamed/);
    await expect(selected).toBeFocused();
  });

  test("Up from the first row stays put", async ({ page }) => {
    const entries = page.locator(FILE_BUTTON_SELECTOR);
    const { y: firstY = 0 } = (await entries.first().boundingBox()) || {};
    const { y: secondY = 0 } = (await entries.nth(1).boundingBox()) || {};

    expect(secondY).toBe(firstY);

    await entries.nth(1).click();
    await page.keyboard.press("ArrowUp");
    await expect(entries.nth(1)).toBeFocused();
  });
});
