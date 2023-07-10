type ColorAttribute = {
  name: string;
  rgb: [number, number, number];
};

export const colorAttributes: Record<string, ColorAttribute> = {
  0: { name: "Black", rgb: [40, 40, 40] },
  1: { name: "Blue", rgb: [69, 133, 136] },
  2: { name: "Green", rgb: [152, 151, 26] },
  3: { name: "Aqua", rgb: [104, 157, 106] },
  4: { name: "Red", rgb: [204, 36, 29] },
  5: { name: "Purple", rgb: [177, 98, 134] },
  6: { name: "Yellow", rgb: [215, 153, 33] },
  7: { name: "White", rgb: [251, 241, 199] },
  8: { name: "Gray", rgb: [235, 219, 178] },
  9: { name: "Light Blue", rgb: [131, 165, 152] },
  A: { name: "Light Green", rgb: [184, 187, 38] },
  B: { name: "Light Aqua", rgb: [142, 192, 124] },
  C: { name: "Light Red", rgb: [251, 73, 52] },
  D: { name: "Light Purple", rgb: [211, 134, 155] },
  E: { name: "Light Yellow", rgb: [250, 189, 47] },
  F: { name: "Bright White", rgb: [251, 241, 199] },
};

export const rgbAnsi = (
  r: number,
  g: number,
  b: number,
  isBackground = false
): string => `\u001B[${isBackground ? "48" : "38"};2;${r};${g};${b}m`;
