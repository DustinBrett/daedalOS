import { test } from "@playwright/test";
import { TERMINAL_BASE_CD } from "e2e/constants";
import {
  captureConsoleLogs,
  disableWallpaper,
  terminalDirectoryMatchesPublicFolder,
  terminalHasRows,
  terminalHasText,
  windowsAreVisible,
} from "e2e/functions";

test.beforeEach(captureConsoleLogs);
test.beforeEach(disableWallpaper);
test.beforeEach(async ({ page }) => page.goto("/?app=Terminal"));
test.beforeEach(windowsAreVisible);
test.beforeEach(terminalHasRows);

test("has base current directory", async ({ page }) =>
  terminalHasText({ page }, `${TERMINAL_BASE_CD}>`));

test("has base directory listing", async ({ page }) =>
  terminalDirectoryMatchesPublicFolder({ page }, TERMINAL_BASE_CD));

test("has 'Program Files' directory listing", async ({ page }) =>
  terminalDirectoryMatchesPublicFolder({ page }, "/Program Files"));

test("has 'System' directory listing", async ({ page }) =>
  terminalDirectoryMatchesPublicFolder({ page }, "/System"));

test("has 'Users' directory listing", async ({ page }) =>
  terminalDirectoryMatchesPublicFolder({ page }, "/Users"));
