import { test } from "@playwright/test";
import { TERMINAL_BASE_CD } from "e2e/constants";
import {
  captureConsoleLogs,
  disableWallpaper,
  sendToTerminal,
  terminalDirectoryMatchesPublicFolder,
  terminalDoesNotHaveText,
  terminalHasRows,
  terminalHasText,
  windowIsHidden,
  windowsAreVisible,
} from "e2e/functions";

test.beforeEach(captureConsoleLogs);
test.beforeEach(disableWallpaper);
test.beforeEach(async ({ page }) => page.goto("/?app=Terminal"));
test.beforeEach(windowsAreVisible);
test.beforeEach(terminalHasRows);

test.describe("has directories", () => {
  test("has base current directory", async ({ page }) =>
    terminalHasText({ page }, `${TERMINAL_BASE_CD}>`));

  test("can change directories", async ({ page }) => {
    await sendToTerminal({ page }, "cd /");
    await terminalHasText({ page }, "/>");
  });
});

test.describe("has directory listings", () => {
  test("has base directory", async ({ page }) =>
    terminalDirectoryMatchesPublicFolder({ page }, TERMINAL_BASE_CD));

  test("has 'Program Files'", async ({ page }) =>
    terminalDirectoryMatchesPublicFolder({ page }, "/Program Files"));

  test("has 'System'", async ({ page }) =>
    terminalDirectoryMatchesPublicFolder({ page }, "/System"));

  test("has 'Users'", async ({ page }) =>
    terminalDirectoryMatchesPublicFolder({ page }, "/Users"));
});

test.describe("has commands", () => {
  test("can 'clear'", async ({ page }) => {
    await sendToTerminal({ page }, "echo hi");
    await terminalHasText({ page }, "hi", 2);
    await sendToTerminal({ page }, "clear");
    await terminalDoesNotHaveText({ page }, "hi");
  });

  test("can exit", async ({ page }) => {
    await sendToTerminal({ page }, "exit");
    await windowIsHidden({ page });
  });
});
