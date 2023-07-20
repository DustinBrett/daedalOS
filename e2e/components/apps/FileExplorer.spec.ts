import { expect, test } from "@playwright/test";
import {
  BASE_APP_FAVICON,
  BASE_APP_TITLE,
  CONTEXT_MENU_SELECTOR,
  FAVICON_SELECTOR,
  FILE_MENU_ITEMS,
  RIGHT_CLICK,
  TEST_APP_ICON,
  TEST_APP_TITLE,
  TEST_APP_TITLE_TEXT,
  TEST_ROOT_FILE,
  TEST_ROOT_FILE_TEXT,
  TEST_ROOT_FILE_TOOLTIP,
  TEST_SEARCH,
  TEST_SEARCH_RESULT,
  WINDOW_SELECTOR,
} from "e2e/constants";
import {
  clickFirstDesktopEntry,
  contextMenuIsVisible,
  desktopFileEntriesAreVisible,
  desktopIsVisible,
  fileExplorerEntryIsHidden,
  fileExplorerEntryIsVisible,
  fileExplorerFileEntriesAreVisible,
  focusOnWindow,
  windowAnimationIsFinished,
  windowIsVisible,
} from "e2e/functions";

test.beforeEach(async ({ page }) => {
  await page.goto("/?app=FileExplorer");

  await desktopIsVisible({ page });
  await desktopFileEntriesAreVisible({ page });
  await windowIsVisible({ page });
  await windowAnimationIsFinished({ page });
  await fileExplorerFileEntriesAreVisible({ page });
  await fileExplorerEntryIsVisible(TEST_ROOT_FILE, { page });
});

test("has address bar", async ({ page }) => {
  await focusOnWindow({ page });

  const addressBar = page.locator(WINDOW_SELECTOR).getByLabel(/^Address$/);

  await expect(addressBar).toHaveValue(TEST_APP_TITLE);

  await addressBar.click();

  await expect(addressBar).toHaveValue("/");

  await addressBar.click(RIGHT_CLICK);

  await contextMenuIsVisible({ page });

  await expect(
    page.locator(CONTEXT_MENU_SELECTOR).getByLabel(/^Copy address$/)
  ).toBeVisible();
});

test("has search box", async ({ page }) => {
  await page
    .locator(WINDOW_SELECTOR)
    .getByLabel(/^Search box$/)
    .type(TEST_SEARCH, {
      delay: 50,
    });

  await contextMenuIsVisible({ page });

  await expect(
    page.locator(CONTEXT_MENU_SELECTOR).getByLabel(TEST_SEARCH_RESULT)
  ).toBeVisible();
});

test("has status bar", async ({ page }) => {
  const windowElement = page.locator(WINDOW_SELECTOR);

  await windowElement.getByLabel(TEST_ROOT_FILE).click();

  await expect(windowElement.getByLabel(/^Total item count$/)).toContainText(
    /^\d items$/
  );
  await expect(
    windowElement.getByLabel(/^Selected item count and size$/)
  ).toContainText(/^1 item selected|\d{3} bytes$/);
});

test("changes title", async ({ page }) => {
  const titleWithApp = `${TEST_APP_TITLE_TEXT} - ${BASE_APP_TITLE}`;
  const isUsingAppTitle = async (): Promise<void> =>
    expect(page).toHaveTitle(titleWithApp);

  await isUsingAppTitle();
  await desktopFileEntriesAreVisible({ page });
  await clickFirstDesktopEntry({ page });

  await expect.poll(() => page.title()).toEqual(BASE_APP_TITLE);

  await focusOnWindow({ page });

  await isUsingAppTitle();
});

test("changes icon", async ({ page }) => {
  const favIcon = page.locator(FAVICON_SELECTOR);
  const isUsingAppIcon = async (): Promise<void> =>
    expect(page.locator(FAVICON_SELECTOR)).toHaveAttribute(
      "href",
      TEST_APP_ICON
    );

  await isUsingAppIcon();
  await desktopFileEntriesAreVisible({ page });
  await clickFirstDesktopEntry({ page });

  await expect
    .poll(() => favIcon.getAttribute("href"))
    .toMatch(BASE_APP_FAVICON);

  await focusOnWindow({ page });

  await isUsingAppIcon();
});

test.describe("has file", () => {
  test.describe("has context menu", () => {
    test.beforeEach(async ({ page }) => {
      page
        .locator(WINDOW_SELECTOR)
        .getByLabel(TEST_ROOT_FILE)
        .click(RIGHT_CLICK);

      await contextMenuIsVisible({ page });
    });

    test("with items", async ({ page }) => {
      const menu = page.locator(CONTEXT_MENU_SELECTOR);

      for (const label of FILE_MENU_ITEMS) {
        // eslint-disable-next-line no-await-in-loop
        await expect(menu.getByLabel(label)).toBeVisible();
      }
    });

    test("can download", async ({ page }) => {
      const downloadPromise = page.waitForEvent("download");

      await page.getByLabel(/^Download$/).click();

      const download = await downloadPromise;

      expect(await download.path()).toBeTruthy();
      expect(download.suggestedFilename()).toMatch(TEST_ROOT_FILE);
    });

    test("can delete", async ({ page }) => {
      await page.getByLabel(/^Delete$/).click();

      await fileExplorerEntryIsHidden(TEST_ROOT_FILE, { page });

      await page.reload();

      await windowIsVisible({ page });

      await fileExplorerEntryIsHidden(TEST_ROOT_FILE, { page });
    });

    // TODO: can cut/copy->paste (to Desktop)
    // TODO: can set backgound (image/video)
    // TODO: can create shortcut (expect prepended name & icon)
  });

  test("with tooltip", async ({ page, request }) => {
    const testFile = page.locator(WINDOW_SELECTOR).getByLabel(TEST_ROOT_FILE);

    // Q: Why both?
    await testFile.hover();
    await testFile.click();

    const statsRequest = await request.head(TEST_ROOT_FILE_TEXT);

    await expect(statsRequest).toBeOK();

    await expect
      .poll(() => testFile.getAttribute("title"))
      .toMatch(TEST_ROOT_FILE_TOOLTIP);
  });

  // TODO: can drag (to Desktop)
  // TODO: can drop (from Desktop)
});

// TODO: has context menu (FOLDER_MENU_ITEMS)
// TODO: has back, forward, recent & up
// TODO: has keyboard shortcuts (Paste, Ctrl: C, X, V)
