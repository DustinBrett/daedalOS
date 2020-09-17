export const isValidUrl = (possibleUrl: string): boolean => {
  try {
    new URL(possibleUrl);
  } catch (_) {
    return false;
  }

  return true;
};
