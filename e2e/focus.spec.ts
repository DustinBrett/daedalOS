import { type Page, expect, test } from "@playwright/test";
import {
  CALENDAR_LABEL,
  CLOCK_LABEL,
  DESKTOP_SELECTOR,
  SEARCH_BUTTON_SELECTOR,
  SEARCH_MENU_INPUT_SELECTOR,
  START_BUTTON_SELECTOR,
  START_MENU_SELECTOR,
  TASKBAR_ENTRY_RUNNING_LABEL,
  TASKBAR_ENTRY_SELECTOR,
  TASKBAR_SELECTOR,
  WINDOW_SELECTOR,
} from "e2e/constants";
import {
  captureConsoleLogs,
  clickDesktop,
  clickSearchButton,
  clickStartButton,
  fileExplorerEntriesAreVisible,
  disableWallpaper,
  loadApp,
  loadTestApp,
  searchMenuIsHidden,
  searchMenuIsVisible,
  startMenuIsHidden,
  startMenuIsVisible,
  taskbarEntriesAreVisible,
  taskbarIsVisible,
  windowAnimationIsFinished,
  windowsAreVisible,
} from "e2e/functions";

// WebKit only mouse-focuses elements carrying an explicit tabindex attribute;
// Chromium & Firefox focus any focusable element on click. These tests pin
// down that difference (and the fixes that depend on it) so regressions in
// either the engines or the app surface immediately. NOTE: Playwright's
// WebKit build always allows keyboard focus of buttons — real Safari's
// default "Option+Tab only" setting cannot be reproduced here, so taskbar
// behavior still needs an occasional real-Safari smoke test.

const activeElement = async (page: Page): Promise<string> =>
  page.evaluate(() => {
    const active = document.activeElement;

    if (!active || active === document.body) return "body";

    return active.id || active.tagName.toLowerCase();
  });

test.describe("engine focus behavior", () => {
  test("clicking a native button focuses the nearest explicit tabindex in WebKit", async ({
    browserName,
    page,
  }) => {
    await page.setContent(
      `<nav id="bar" tabindex="-1"><button id="plain" type="button">Plain</button></nav>`
    );
    await page.click("#plain");

    expect(await activeElement(page)).toBe(
      browserName === "webkit" ? "bar" : "plain"
    );
  });

  test("clicking a native button without focusable ancestors leaves body focused in WebKit", async ({
    browserName,
    page,
  }) => {
    await page.setContent(`<button id="plain" type="button">Plain</button>`);
    await page.click("#plain");

    expect(await activeElement(page)).toBe(
      browserName === "webkit" ? "body" : "plain"
    );
  });

  test("an explicit tabindex makes a native button click-focusable in every engine", async ({
    page,
  }) => {
    await page.setContent(
      `<nav id="bar" tabindex="-1"><button id="explicit" tabindex="0" type="button">Explicit</button></nav>`
    );
    await page.click("#explicit");

    expect(await activeElement(page)).toBe("explicit");
  });

  test("divs with an explicit tabindex are click-focusable in every engine", async ({
    page,
  }) => {
    await page.setContent(
      `<div id="minus" tabindex="-1">Minus</div><div id="zero" tabindex="0">Zero</div>`
    );

    await page.click("#minus");
    expect(await activeElement(page)).toBe("minus");

    await page.click("#zero");
    expect(await activeElement(page)).toBe("zero");
  });

  test("plain divs never take focus from a click", async ({ page }) => {
    await page.setContent(`<div id="plain">Plain</div>`);
    await page.click("#plain");

    expect(await activeElement(page)).toBe("body");
  });

  test("Tab skips tabindex -1 but reaches buttons and tabindex 0 divs", async ({
    page,
  }) => {
    await page.setContent(
      `<button id="first" type="button">First</button><div id="skipped" tabindex="-1">Skipped</div><div id="second" tabindex="0">Second</div>`
    );

    await page.keyboard.press("Tab");
    expect(await activeElement(page)).toBe("first");

    await page.keyboard.press("Tab");
    expect(await activeElement(page)).toBe("second");
  });

  test("blur relatedTarget points at the element that actually took focus", async ({
    browserName,
    page,
  }) => {
    await page.setContent(
      `<input id="field" /><nav id="bar" tabindex="-1"><button id="plain" type="button">Plain</button></nav><div id="nothing">Nothing</div>`
    );
    await page.focus("#field");
    await page.evaluate(() => {
      document.body.dataset.relatedTarget = "unset";
      document.querySelector<HTMLInputElement>("#field")?.addEventListener(
        "focusout",
        ({ relatedTarget }) => {
          document.body.dataset.relatedTarget =
            relatedTarget instanceof Element
              ? relatedTarget.id || relatedTarget.tagName.toLowerCase()
              : "null";
        },
        { once: true }
      );
    });

    // This is the mechanism behind close-on-blur: in WebKit a click on a
    // bare button reports the tabindex ancestor as relatedTarget instead
    await page.click("#plain");
    expect(await page.evaluate(() => document.body.dataset.relatedTarget)).toBe(
      browserName === "webkit" ? "bar" : "plain"
    );

    await page.focus("#field");
    await page.evaluate(() => {
      document.querySelector<HTMLInputElement>("#field")?.addEventListener(
        "focusout",
        ({ relatedTarget }) => {
          document.body.dataset.relatedTarget = relatedTarget
            ? "element"
            : "null";
        },
        { once: true }
      );
    });
    await page.click("#nothing");
    expect(await page.evaluate(() => document.body.dataset.relatedTarget)).toBe(
      "null"
    );
  });

  // Only Chromium dispatches focus events when the focused element is
  // removed, so close-on-blur logic can never rely on them cross-engine
  // (foreground window tracking clears via desktop onFocusCapture instead)
  test("removing the focused element fires blur events only in Chromium", async ({
    browserName,
    page,
  }) => {
    await page.setContent(`<button id="doomed" type="button">Doomed</button>`);
    await page.focus("#doomed");
    await page.evaluate(() => {
      document.body.dataset.focusEvents = "none";

      const record = (): void => {
        document.body.dataset.focusEvents = "fired";
      };

      document.addEventListener("focusout", record, true);
      document.addEventListener("blur", record, true);
      document.querySelector("#doomed")?.remove();
    });

    expect(await page.evaluate(() => document.body.dataset.focusEvents)).toBe(
      browserName === "chromium" ? "fired" : "none"
    );
    expect(await activeElement(page)).toBe("body");
  });

  // The calendar's close-on-focus-loss relies on this: blur can't be
  // observed from an ancestor without capture, focusout can
  test("focusout bubbles to ancestors but blur does not", async ({ page }) => {
    await page.setContent(
      `<div id="outer"><input id="inner" /></div><input id="other" />`
    );
    await page.evaluate(() => {
      document.body.dataset.blur = "none";
      document.body.dataset.focusout = "none";

      const outer = document.querySelector<HTMLDivElement>("#outer");

      outer?.addEventListener("blur", () => {
        document.body.dataset.blur = "fired";
      });
      outer?.addEventListener("focusout", () => {
        document.body.dataset.focusout = "fired";
      });
    });

    await page.focus("#inner");
    await page.focus("#other");

    expect(await page.evaluate(() => document.body.dataset.focusout)).toBe(
      "fired"
    );
    expect(await page.evaluate(() => document.body.dataset.blur)).toBe("none");
  });

  test("programmatic focus reaches tabindex -1 elements in every engine", async ({
    page,
  }) => {
    await page.setContent(`<div id="target" tabindex="-1">Target</div>`);
    await page.evaluate(() =>
      document.querySelector<HTMLDivElement>("#target")?.focus()
    );

    expect(await activeElement(page)).toBe("target");
  });
});

test.describe("popup focus management", () => {
  test.beforeEach(captureConsoleLogs());
  test.beforeEach(disableWallpaper);
  test.beforeEach(loadApp());
  test.beforeEach(taskbarIsVisible);

  test("start menu takes focus when opened and Escape closes it", async ({
    page,
  }) => {
    await clickStartButton({ page });
    await startMenuIsVisible({ page });

    await expect(page.locator(START_MENU_SELECTOR)).toBeFocused();

    await page.keyboard.press("Escape");
    await startMenuIsHidden({ page });
  });

  test("search focuses its input when opened and Escape closes it", async ({
    page,
  }) => {
    await clickSearchButton({ page });
    await searchMenuIsVisible({ page });

    await expect(page.locator(SEARCH_MENU_INPUT_SELECTOR)).toBeFocused();

    await page.keyboard.press("Escape");
    await searchMenuIsHidden({ page });
  });

  test("calendar takes focus when opened and closes when focus leaves", async ({
    page,
  }) => {
    const calendar = page.getByLabel(CALENDAR_LABEL);

    await page.locator(TASKBAR_SELECTOR).getByLabel(CLOCK_LABEL).click();
    await expect(calendar).toBeVisible();
    await expect(calendar).toBeFocused();

    await clickDesktop({ page });
    await expect(calendar).toBeHidden();
  });

  test("start menu closes when clicking the desktop", async ({ page }) => {
    await clickStartButton({ page });
    await startMenuIsVisible({ page });

    await clickDesktop({ page });
    await startMenuIsHidden({ page });
  });

  test("search menu closes when clicking the desktop", async ({ page }) => {
    await clickSearchButton({ page });
    await searchMenuIsVisible({ page });

    await clickDesktop({ page });
    await searchMenuIsHidden({ page });
  });
});

test.describe("taskbar toggle buttons", () => {
  test.beforeEach(captureConsoleLogs());
  test.beforeEach(disableWallpaper);
  test.beforeEach(loadApp());
  test.beforeEach(taskbarIsVisible);

  test("toggles carry the explicit tabindex WebKit needs for click focus", async ({
    page,
  }) => {
    await expect(page.locator(START_BUTTON_SELECTOR)).toHaveAttribute(
      "tabindex",
      "0"
    );
    await expect(page.locator(SEARCH_BUTTON_SELECTOR)).toHaveAttribute(
      "tabindex",
      "0"
    );
    await expect(
      page.locator(TASKBAR_SELECTOR).getByLabel(CLOCK_LABEL)
    ).toHaveAttribute("tabindex", "0");
  });

  test("start menu closes on a second start button click", async ({ page }) => {
    await clickStartButton({ page });
    await startMenuIsVisible({ page });

    await clickStartButton({ page });
    await startMenuIsHidden({ page });
  });

  test("search menu closes on a second search button click", async ({
    page,
  }) => {
    await clickSearchButton({ page });
    await searchMenuIsVisible({ page });

    await clickSearchButton({ page });
    await searchMenuIsHidden({ page });
  });

  test("calendar closes on a second clock click", async ({ page }) => {
    const clock = page.locator(TASKBAR_SELECTOR).getByLabel(CLOCK_LABEL);
    const calendar = page.getByLabel(CALENDAR_LABEL);

    await clock.click();
    await expect(calendar).toBeVisible();

    await clock.click();
    await expect(calendar).toBeHidden();
  });
});

test.describe("taskbar entries", () => {
  test.beforeEach(captureConsoleLogs());
  test.beforeEach(disableWallpaper);
  test.beforeEach(loadTestApp);
  test.beforeEach(windowsAreVisible);
  test.beforeEach(windowAnimationIsFinished);
  test.beforeEach(taskbarEntriesAreVisible);

  test("entry is a native button with the explicit tabindex WebKit needs", async ({
    page,
  }) => {
    const entry = page
      .locator(TASKBAR_ENTRY_SELECTOR)
      .getByLabel(TASKBAR_ENTRY_RUNNING_LABEL);

    await expect(entry).toHaveJSProperty("tagName", "BUTTON");
    await expect(entry).toHaveAttribute("tabindex", "0");
  });

  test("clicking an entry focuses it and minimizes its foreground window", async ({
    page,
  }) => {
    const entry = page
      .locator(TASKBAR_ENTRY_SELECTOR)
      .getByLabel(TASKBAR_ENTRY_RUNNING_LABEL);
    const window = page.locator(WINDOW_SELECTOR);

    await entry.click();

    await expect(entry).toBeFocused();
    await expect(window).toHaveAttribute("aria-hidden", "true");
  });

  test("entry is keyboard operable with Enter and Space", async ({ page }) => {
    const entry = page
      .locator(TASKBAR_ENTRY_SELECTOR)
      .getByLabel(TASKBAR_ENTRY_RUNNING_LABEL);
    const window = page.locator(WINDOW_SELECTOR);

    await entry.press("Enter");
    await expect(window).toHaveAttribute("aria-hidden", "true");

    await entry.press(" ");
    await expect(window).not.toHaveAttribute("aria-hidden", "true");
  });

  // Removing a focused node fires no blur outside Chromium, so foreground
  // tracking additionally clears when the desktop takes focus
  test("desktop click clears the foreground window state", async ({ page }) => {
    const entry = page
      .locator(TASKBAR_ENTRY_SELECTOR)
      .getByLabel(TASKBAR_ENTRY_RUNNING_LABEL);

    // Wait out File Explorer's post-load refocus before blurring
    await fileExplorerEntriesAreVisible({ page });
    await expect(entry).toHaveAttribute("aria-pressed", "true");

    const { width = 0 } =
      (await page.locator(DESKTOP_SELECTOR).boundingBox()) || {};

    // Top-right corner is empty desktop; (0,0) can hit desktop icons
    await clickDesktop({ page }, false, width - 25, 25);

    await expect(entry).toHaveAttribute("aria-pressed", "false");
  });

  test("search menu closes when an entry is clicked", async ({ page }) => {
    // Wait out File Explorer's post-load refocus; it could blur-close the
    // menu before the click exercises the closeOnTaskbarEntries path
    await fileExplorerEntriesAreVisible({ page });

    await clickSearchButton({ page });
    await searchMenuIsVisible({ page });

    await page
      .locator(TASKBAR_ENTRY_SELECTOR)
      .getByLabel(TASKBAR_ENTRY_RUNNING_LABEL)
      .click();

    await searchMenuIsHidden({ page });
  });
});
