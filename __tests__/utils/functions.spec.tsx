import { getFormattedSize } from "utils/functions";

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
