export type ColorAttribute = {
  name: string;
  rgb: [number, number, number];
};

export const colorAttributes: Record<string, ColorAttribute> = {
  0: { name: "Black", rgb: [12, 12, 12] },
  1: { name: "Blue", rgb: [0, 55, 218] },
  2: { name: "Green", rgb: [19, 161, 14] },
  3: { name: "Aqua", rgb: [58, 150, 221] },
  4: { name: "Red", rgb: [197, 15, 31] },
  5: { name: "Purple", rgb: [136, 23, 152] },
  6: { name: "Yellow", rgb: [193, 156, 0] },
  7: { name: "White", rgb: [204, 204, 204] },
  8: { name: "Gray", rgb: [118, 118, 118] },
  9: { name: "Light Blue", rgb: [59, 120, 255] },
  A: { name: "Light Green", rgb: [22, 198, 12] },
  B: { name: "Light Aqua", rgb: [97, 214, 214] },
  C: { name: "Light Red", rgb: [231, 72, 86] },
  D: { name: "Light Purple", rgb: [180, 0, 158] },
  E: { name: "Light Yellow", rgb: [249, 241, 165] },
  F: { name: "Bright White", rgb: [242, 242, 242] },
};

export const rgbAnsi = (
  r: number,
  g: number,
  b: number,
  isBackground = false
): string => `\u001B[${isBackground ? "48" : "38"};2;${r};${g};${b}m`;
