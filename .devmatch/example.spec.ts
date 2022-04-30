import { test, expect, Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/");
});

test.describe("New Todo", () => {
  test("should allow me to add todo items", async ({ page }) => {
    // Open the Start Menu
    await page.locator("main > nav > button").click();

    // Find the new menu
    await expect(
      page.locator("main > nav > ol > li > button > figure > figcaption", {
        hasText: "Foo",
      })
    ).toHaveCount(1);

    //
    await expect(
      page.locator("main > nav > ol > li > button > figure > figcaption", {
        hasText: "Bar",
      })
    ).toHaveCount(0);
    //.toContainText( currentYear + " All Rights Reserved.");
  });
});

// async function createDefaultTodos(page: Page) {
//   for (const item of TODO_ITEMS) {
//     await page.locator('.new-todo').fill(item);
//     await page.locator('.new-todo').press('Enter');
//   }
// }
//
// async function checkNumberOfTodosInLocalStorage(page: Page, expected: number) {
//   return await page.waitForFunction(e => {
//     return JSON.parse(localStorage['react-todos']).length === e;
//   }, expected);
// }
//
// async function checkNumberOfCompletedTodosInLocalStorage(page: Page, expected: number) {
//   return await page.waitForFunction(e => {
//     return JSON.parse(localStorage['react-todos']).filter(i => i.completed).length === e;
//   }, expected);
// }
//
// async function checkTodosInLocalStorage(page: Page, title: string) {
//   return await page.waitForFunction(t => {
//     return JSON.parse(localStorage['react-todos']).map(i => i.title).includes(t);
//   }, title);
// }
