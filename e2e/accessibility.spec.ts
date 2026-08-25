import { expect, test } from "@playwright/test";
import {
  CALENDAR_LABEL,
  CLOCK_LABEL,
  CONTEXT_MENU_SELECTOR,
  DESKTOP_ENTRIES_SELECTOR,
  DESKTOP_SELECTOR,
  FILE_EXPLORER_NAV_SELECTOR,
  FILE_EXPLORER_SELECTOR,
  SEARCH_BUTTON_SELECTOR,
  SEARCH_MENU_SELECTOR,
  START_BUTTON_SELECTOR,
  START_MENU_SELECTOR,
  TASKBAR_ENTRIES_SELECTOR,
  TASKBAR_ENTRY_RUNNING_LABEL,
  TASKBAR_ENTRY_SELECTOR,
  TASKBAR_SELECTOR,
  TEST_APP_TITLE,
  TEST_APP_TITLE_TEXT,
  WINDOW_SELECTOR,
  WINDOW_TITLEBAR_SELECTOR,
} from "e2e/constants";
import {
  captureConsoleLogs,
  clickDesktop,
  clickMinimizeWindow,
  clickSearchButton,
  clickStartButton,
  contextMenuIsVisible,
  desktopEntriesAreVisible,
  disableWallpaper,
  loadApp,
  loadTestApp,
  pressDesktopKeys,
  scanPasses,
  searchMenuIsVisible,
  startMenuIsVisible,
  taskbarEntriesAreVisible,
  taskbarIsVisible,
  windowAnimationIsFinished,
  windowsAreVisible,
} from "e2e/functions";

test.beforeEach(captureConsoleLogs());
test.beforeEach(disableWallpaper);

test.describe("desktop shell", () => {
  test.beforeEach(loadApp());
  test.beforeEach(desktopEntriesAreVisible);
  test.beforeEach(taskbarIsVisible);

  test("desktop is a named list with labeled entries", async ({ page }) => {
    await expect(page.locator(`${DESKTOP_SELECTOR}>ol`)).toHaveAttribute(
      "aria-label",
      "Desktop"
    );
    await expect(
      page.locator(`${DESKTOP_ENTRIES_SELECTOR} button`).first()
    ).toHaveAttribute("aria-label", /.+/);
  });

  test("shell is keyboard operable", async ({ page }) => {
    await page.keyboard.press("Tab");
    await expect(
      page.locator(`${DESKTOP_ENTRIES_SELECTOR} button`).first()
    ).toBeFocused();

    await page.locator(START_BUTTON_SELECTOR).press("Enter");
    await startMenuIsVisible({ page });
  });

  test("desktop icons are reachable with the keyboard", async ({ page }) => {
    await pressDesktopKeys("ArrowRight", { page });

    await expect(page.locator(DESKTOP_ENTRIES_SELECTOR).first()).toHaveClass(
      /focus-within/
    );
  });

  test("taskbar landmarks are named", async ({ page }) => {
    await expect(page.locator(TASKBAR_SELECTOR)).toHaveAttribute(
      "aria-label",
      "Taskbar"
    );
    await expect(page.locator(TASKBAR_ENTRIES_SELECTOR)).toHaveAttribute(
      "aria-label",
      "Running applications"
    );
  });

  test("start button exposes its popup state", async ({ page }) => {
    const startButton = page.locator(START_BUTTON_SELECTOR);

    await expect(startButton).toHaveAttribute("aria-haspopup", "dialog");
    await expect(startButton).toHaveAttribute("aria-expanded", "false");

    await clickStartButton({ page });
    await startMenuIsVisible({ page });

    await expect(startButton).toHaveAttribute("aria-expanded", "true");
    await expect(startButton).toHaveAttribute("aria-controls", "startMenu");
    await expect(page.locator(START_MENU_SELECTOR)).toHaveAttribute(
      "role",
      "dialog"
    );
  });

  test("start menu passes accessibility scan", async ({ page }) => {
    await clickStartButton({ page });
    await startMenuIsVisible({ page });
    await scanPasses(page, START_MENU_SELECTOR);
  });

  test("search menu is a labeled dialog with tabs", async ({ page }) => {
    await clickSearchButton({ page });
    await searchMenuIsVisible({ page });

    const searchMenu = page.locator(SEARCH_MENU_SELECTOR);

    await expect(searchMenu).toHaveAttribute("role", "dialog");
    await expect(searchMenu.getByLabel(/^Type here to search$/)).toBeVisible();
    await expect(searchMenu.locator("[role=tablist]")).toBeVisible();
    await expect(
      searchMenu.locator("[role=tab]", { hasText: "All" })
    ).toHaveAttribute("aria-selected", "true");
  });

  test("search menu passes accessibility scan", async ({ page }) => {
    await clickSearchButton({ page });
    await searchMenuIsVisible({ page });
    await scanPasses(page, SEARCH_MENU_SELECTOR);
  });

  test("clock is a labeled button that controls the calendar", async ({
    page,
  }) => {
    const clock = page.locator(TASKBAR_SELECTOR).getByLabel(CLOCK_LABEL);

    await expect(clock).toHaveJSProperty("tagName", "BUTTON");
    await expect(clock).toHaveAttribute("aria-haspopup", "dialog");
    await expect(clock).toHaveAttribute("aria-expanded", "false");

    await clock.click();

    const calendar = page.locator(DESKTOP_SELECTOR).getByLabel(CALENDAR_LABEL);

    await expect(calendar).toBeVisible();
    await expect(calendar).toHaveAttribute("role", "dialog");
    await expect(clock).toHaveAttribute("aria-expanded", "true");
    await expect(clock).toHaveAttribute("aria-controls", "calendar");

    await expect(calendar.locator("[aria-current=date]")).toHaveCount(1);
    await expect(calendar.getByLabel(/^Previous$/)).toBeVisible();
    await expect(calendar.getByLabel(/^Next$/)).toBeVisible();

    await clock.click();

    await expect(calendar).toBeHidden();
    await expect(clock).toHaveAttribute("aria-expanded", "false");
  });

  test("taskbar popup toggles are native buttons", async ({ page }) => {
    await expect(page.locator(START_BUTTON_SELECTOR)).toHaveJSProperty(
      "tagName",
      "BUTTON"
    );
    await expect(page.locator(SEARCH_BUTTON_SELECTOR)).toHaveJSProperty(
      "tagName",
      "BUTTON"
    );
  });

  test("context menu is named", async ({ page }) => {
    await clickDesktop({ page }, true);
    await contextMenuIsVisible({ page });

    await expect(page.locator(CONTEXT_MENU_SELECTOR)).toHaveAttribute(
      "aria-label",
      "Context"
    );
  });
});

test.describe("windows", () => {
  test.beforeEach(loadTestApp);
  test.beforeEach(windowsAreVisible);
  test.beforeEach(windowAnimationIsFinished);

  test("window is a named dialog", async ({ page }) => {
    const window = page.locator(WINDOW_SELECTOR);

    await expect(window).toHaveAttribute("role", "dialog");
    await expect(window).toHaveAttribute("aria-label", TEST_APP_TITLE);
  });

  test("titlebar controls are named", async ({ page }) => {
    const titlebar = page.locator(WINDOW_TITLEBAR_SELECTOR);

    await expect(titlebar.getByLabel(/^Minimize$/)).toBeVisible();
    await expect(titlebar.getByLabel(/^Maximize$/)).toBeVisible();
    await expect(titlebar.getByLabel(/^Close$/)).toBeVisible();
  });

  test("taskbar entry exposes running and foreground state", async ({
    page,
  }) => {
    await taskbarEntriesAreVisible({ page });

    const taskbarEntry = page
      .locator(TASKBAR_ENTRY_SELECTOR)
      .getByLabel(TASKBAR_ENTRY_RUNNING_LABEL);

    await expect(taskbarEntry).toBeVisible();
    await expect(taskbarEntry).toHaveAttribute("aria-pressed", "true");
  });

  test("minimized window is hidden from assistive technology", async ({
    page,
  }) => {
    await taskbarEntriesAreVisible({ page });
    await clickMinimizeWindow({ page });

    const window = page.locator(WINDOW_SELECTOR);

    await expect(window).toHaveAttribute("aria-hidden", "true");
    await expect(window).toHaveAttribute("inert", "");
    await expect(
      page
        .locator(TASKBAR_ENTRY_SELECTOR)
        .getByLabel(TASKBAR_ENTRY_RUNNING_LABEL)
    ).toHaveAttribute("aria-pressed", "false");
  });

  test("file explorer chrome is labeled", async ({ page }) => {
    const nav = page.locator(FILE_EXPLORER_NAV_SELECTOR);

    await expect(nav.getByLabel(/^Address$/)).toBeVisible();
    await expect(nav.getByLabel(/^Search Box$/)).toBeVisible();
    await expect(page.locator(FILE_EXPLORER_SELECTOR)).toHaveAttribute(
      "aria-label",
      TEST_APP_TITLE_TEXT
    );
  });

  test("window passes accessibility scan", async ({ page }) => {
    await scanPasses(page, WINDOW_SELECTOR);
  });
});
