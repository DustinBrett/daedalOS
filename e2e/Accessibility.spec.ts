import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ACCESSIBILITY_EXCEPTION_IDS } from "e2e/constants";
import {
  canvasBackgroundIsVisible,
  clockCanvasOrTextIsVisible,
  desktopEntriesAreVisible,
  loadApp,
  startButtonIsVisible,
  taskbarIsVisible,
} from "e2e/functions";

test.beforeEach(loadApp);
test.beforeEach(desktopEntriesAreVisible);
test.beforeEach(taskbarIsVisible);
test.beforeEach(startButtonIsVisible);
test.beforeEach(clockCanvasOrTextIsVisible);
test.beforeEach(canvasBackgroundIsVisible);

test("pass accessibility scan", async ({ page }) =>
  expect(
    (
      await new AxeBuilder({ page })
        .disableRules(ACCESSIBILITY_EXCEPTION_IDS)
        .analyze()
    ).violations
  ).toEqual([]));
