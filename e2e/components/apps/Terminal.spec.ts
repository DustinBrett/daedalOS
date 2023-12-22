import { test } from "@playwright/test";
import { TERMINAL_BASE_CD, TERMINAL_TEST_FILE } from "e2e/constants";
import {
  captureConsoleLogs,
  disableWallpaper,
  sendToTerminal,
  terminalDirectoryMatchesPublicFolder,
  terminalDoesNotHaveText,
  terminalFileMatchesPublicFile,
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

test.describe("has file system access", () => {
  test.describe("has current directory", () => {
    test("has default base", async ({ page }) =>
      terminalHasText({ page }, `${TERMINAL_BASE_CD}>`));

    test("can change directories", async ({ page }) => {
      await sendToTerminal({ page }, "cd /");
      await terminalHasText({ page }, "/>");
    });
  });

  test("can read file", async ({ page }) => {
    await sendToTerminal({ page }, `type ${TERMINAL_TEST_FILE}`);
    await terminalFileMatchesPublicFile({ page }, TERMINAL_TEST_FILE);
  });

  test.describe("can read folder", () => {
    test("has base directory", async ({ page }) =>
      terminalDirectoryMatchesPublicFolder({ page }, TERMINAL_BASE_CD));

    test("has 'Program Files'", async ({ page }) =>
      terminalDirectoryMatchesPublicFolder({ page }, "/Program Files"));

    test("has 'System'", async ({ page }) =>
      terminalDirectoryMatchesPublicFolder({ page }, "/System"));

    test("has 'Users'", async ({ page }) =>
      terminalDirectoryMatchesPublicFolder({ page }, "/Users"));
  });

  test.describe("can write", () => {
    test("can create file", async ({ page }) => {
      const testFileName = "test.txt";

      await sendToTerminal({ page }, `touch ${testFileName}`);

      await sendToTerminal({ page }, "ls");
      await terminalHasText({ page }, `0 ${testFileName}`);

      await sendToTerminal({ page }, `ls ${testFileName}`);
      await terminalDoesNotHaveText({ page }, "File Not Found");
    });
  });
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
