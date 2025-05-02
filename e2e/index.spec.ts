import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ACCESSIBILITY_EXCEPTION_IDS } from "e2e/constants";
import {
  backgroundCanvasMaybeIsVisible,
  captureConsoleLogs,
  clockCanvasMaybeIsVisible,
  desktopEntriesAreVisible,
  loadApp,
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

test("can pass accessibility scan", async ({ page }) =>
  expect(
    (
      await new AxeBuilder({ page })
        .disableRules(ACCESSIBILITY_EXCEPTION_IDS)
        .analyze()
    ).violations
  ).toEqual([]));
