import { test } from "@playwright/test";
import {
  backgroundCanvasMaybeIsVisible,
  captureConsoleLogs,
  clockCanvasMaybeIsVisible,
  desktopEntriesAreVisible,
  loadApp,
  scanPasses,
  startButtonIsVisible,
  taskbarIsVisible,
} from "e2e/functions";

test.beforeEach(captureConsoleLogs());
test.beforeEach(loadApp());
test.beforeEach(desktopEntriesAreVisible);
test.beforeEach(taskbarIsVisible);
test.beforeEach(startButtonIsVisible);
test.beforeEach(clockCanvasMaybeIsVisible);
test.beforeEach(backgroundCanvasMaybeIsVisible);

test("can pass accessibility scan", async ({ page }) => scanPasses(page));
