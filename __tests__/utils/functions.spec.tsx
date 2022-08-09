import { getFormattedSize, loadFiles } from "utils/functions";
import { mockOnLoadEventListener } from "utils/testFunctions";

const formattedSizeCases: [number, string][] = [
  [0, "0 bytes"],
  [1, "1 byte"],
  [2, "2 bytes"],
  [1023, "1023 bytes"],
  [1024, "1.00 KB"],
  [1034, "1.00 KB"],
  [1035, "1.01 KB"],
  [3957, "3.86 KB"],
  [238770, "233 KB"],
  [1048081, "0.99 MB"],
  [9968640, "9.50 MB"],
  [16777216, "16.0 MB"],
];

describe("gets formatted size", () => {
  test.each(formattedSizeCases)("given %p render %p", (size, result) =>
    expect(getFormattedSize(size)).toBe(result)
  );
});

const scriptsStylesCases: string[][][] = [
  [["/Example/Path/script.js", "/Example/Path/style.css"]],
];

describe("loads scripts & styles", () => {
  beforeAll(() => {
    HTMLLinkElement.prototype.addEventListener = mockOnLoadEventListener;
    HTMLScriptElement.prototype.addEventListener = mockOnLoadEventListener;
  });

  test.each(scriptsStylesCases)(
    "load js files as <script /> & css files as <link />",
    async (urls) => {
      await loadFiles(urls);

      urls.forEach((url) =>
        expect(
          [...document.head.childNodes].some((childNode) => {
            const childUrl =
              (childNode as HTMLLinkElement)?.href ||
              (childNode as HTMLScriptElement)?.src;

            return childUrl?.includes(encodeURI(url));
          })
        ).toBeTruthy()
      );
    }
  );
});
