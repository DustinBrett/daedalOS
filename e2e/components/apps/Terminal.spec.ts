import { test } from "@playwright/test";
import { TERMINAL_BASE_CD } from "e2e/constants";
import {
  captureConsoleLogs,
  didCaptureConsoleLogs,
  disableWallpaper,
  sendToTerminal,
  sheepIsVisible,
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
    test("default base", async ({ page }) => {
      await terminalHasText({ page }, `${TERMINAL_BASE_CD}>`, 1, true);
      await sendToTerminal({ page }, "pwd");
      await terminalHasText({ page }, TERMINAL_BASE_CD, 3);
    });

    test("can change", async ({ page }) => {
      await sendToTerminal({ page }, "cd /");
      await terminalHasText({ page }, "/>", 1, true);
    });
  });

  test.describe("can read", () => {
    test.describe("file", () => {
      test("contents", async ({ page }) => {
        const testFile = `${TERMINAL_BASE_CD}/desktop.ini`;

        await sendToTerminal({ page }, `type ${testFile}`);
        await terminalFileMatchesPublicFile({ page }, testFile);
      });

      test("mime type", async ({ page }) => {
        const testFile = "sitemap.xml";

        await sendToTerminal({ page }, `file /${testFile}`);
        await terminalHasText({ page }, `/${testFile}: application/xml`);
      });
    });

    test.describe("folder", () => {
      test("has base directory", async ({ page }) =>
        terminalDirectoryMatchesPublicFolder({ page }, TERMINAL_BASE_CD));

      test("has 'Program Files'", async ({ page }) =>
        terminalDirectoryMatchesPublicFolder({ page }, "/Program Files"));

      test("has 'System'", async ({ page }) =>
        terminalDirectoryMatchesPublicFolder({ page }, "/System"));

      test("has 'Users'", async ({ page }) =>
        terminalDirectoryMatchesPublicFolder({ page }, "/Users"));
    });
  });

  test.describe("can create", () => {
    test("file", async ({ page }) => {
      const testFileName = "test.txt";

      await sendToTerminal({ page }, `touch ${testFileName}`);

      await sendToTerminal({ page }, "ls");
      await terminalHasText({ page }, `0 ${testFileName}`);

      await sendToTerminal({ page }, `ls ${testFileName}`);
      await terminalDoesNotHaveText({ page }, "File Not Found");
    });

    test("folder", async ({ page }) => {
      const testFolderName = "test_folder";

      await sendToTerminal({ page }, `md ${testFolderName}`);

      await sendToTerminal({ page }, "ls");
      await terminalHasText({ page }, `<DIR>         ${testFolderName}`);

      await sendToTerminal({ page }, `cd ${testFolderName}`);
      await terminalHasText(
        { page },
        `${TERMINAL_BASE_CD}/${testFolderName}>`,
        1,
        true
      );
    });
  });

  test.describe("can delete", () => {
    test("file", async ({ page }) => {
      const testFile = "desktop.ini";

      await sendToTerminal({ page }, "ls");
      await terminalHasText({ page }, testFile);

      await sendToTerminal({ page }, `del ${testFile}`);
      await sendToTerminal({ page }, "clear");

      await sendToTerminal({ page }, "ls");
      await terminalDoesNotHaveText({ page }, testFile);
    });

    test("folder", async ({ page }) => {
      const testFolder = "Music";

      await sendToTerminal({ page }, "ls");
      await terminalHasText({ page }, testFolder);

      await sendToTerminal({ page }, `rd ${testFolder}`);
      await sendToTerminal({ page }, "clear");

      await sendToTerminal({ page }, "ls");
      await terminalDoesNotHaveText({ page }, testFolder);
    });
  });

  test.describe("can find", () => {
    test("file", async ({ page }) => {
      await sendToTerminal({ page }, "find credit");
      await terminalHasText({ page }, "/CREDITS.md");
    });

    test("folder", async ({ page }) => {
      await sendToTerminal({ page }, "find document");
      await terminalHasText(
        { page },
        "/Users/Public/Documents",
        1,
        false,
        true
      );
    });
  });
});

test.describe("has commands", () => {
  test("can 'echo' then 'clear'", async ({ page }) => {
    await sendToTerminal({ page }, "echo hi");
    await terminalHasText({ page }, "hi", 2);

    await sendToTerminal({ page }, "clear");
    await terminalDoesNotHaveText({ page }, "hi");
  });

  test("can exit", async ({ page }) => {
    await sendToTerminal({ page }, "exit");
    await windowIsHidden({ page });
  });

  test("can call 'sheep'", async ({ page }) => {
    await sendToTerminal({ page }, "sheep");
    await sheepIsVisible({ page });
  });
});

test.afterEach(didCaptureConsoleLogs);
