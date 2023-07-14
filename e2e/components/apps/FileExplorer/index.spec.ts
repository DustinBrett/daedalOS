import { expect, test } from "@playwright/test";

const CONTEXT_MENU_SELECTOR = "#__next>nav";
const FILE_EXPLORER_URL = "/?app=FileExplorer";

const TEST_SEARCH = "CREDITS";
const TEST_SEARCH_RESULT = /^CREDITS.md$/;

test("has session file", async ({ page }) => {
  await page.goto(FILE_EXPLORER_URL);

  const window = page.locator("section");

  await expect(window.getByLabel(/^session.json$/)).toHaveCount(1);
});

test("has address bar", async ({ page }) => {
  await page.goto(FILE_EXPLORER_URL);

  const addressBar = page.locator("section").getByLabel(/^Address$/);

  await expect(addressBar).toHaveValue(/^My PC$/);
});

test("has search box", async ({ page }) => {
  await page.goto(FILE_EXPLORER_URL);

  const searchBox = page.locator("section").getByLabel(/^Search box$/);

  await searchBox.fill(TEST_SEARCH);

  await expect(
    page.locator(CONTEXT_MENU_SELECTOR).getByLabel(TEST_SEARCH_RESULT)
  ).toHaveCount(1);
});

test("has status bar", async ({ page }) => {
  await page.goto(FILE_EXPLORER_URL);

  const window = page.locator("section");

  await window.getByLabel(/^session.json$/).click();

  const footer = window.locator("footer");

  await expect(footer.getByLabel(/^Total item count$/)).toContainText(
    /^8 items$/
  );
  await expect(
    footer.getByLabel(/^Selected item count and size$/)
  ).toContainText(/^1 item selected|\d{3} bytes$/);
});
