import { basename } from "path";
import { expect, test } from "@playwright/test";
import desktopIcons from "public/.index/desktopIcons.json";
import { OG_TAGS } from "e2e/constants";
import { loadApp } from "e2e/functions";

test.beforeEach(loadApp());

test.describe("has correct tags", () => {
  test("has link preloads", async ({ page }) => {
    const preloadElements = page.locator("link[rel=preload]");

    await expect(preloadElements).toHaveCount(desktopIcons.length);

    const fileNames = desktopIcons.map((filePath) => basename(filePath));

    (
      await Promise.all(
        (await preloadElements.elementHandles()).map(
          async (preloadElement) =>
            basename(
              (await preloadElement.getAttribute("href")) ||
                (await preloadElement.getAttribute("imagesrcset")) ||
                ""
            ).split(" ")[0]
        )
      )
    ).forEach((preloadHref) => expect(fileNames).toContain(preloadHref));
  });

  test("has open graphs", async ({ page }) => {
    await expect(page.locator("meta[property^='og:']")).toHaveCount(
      OG_TAGS.length
    );

    OG_TAGS.forEach((tag) =>
      expect(() =>
        expect(page.locator(`meta[property='og:${tag}']`)).toHaveAttribute(
          "content",
          /^.+$/
        )
      ).toPass()
    );
  });
});
