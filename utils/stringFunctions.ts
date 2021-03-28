/* eslint import/prefer-default-export: off */
export const pxToNumber = (value: string): number =>
  Number(value.replace('px', ''));
