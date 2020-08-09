export const isValidUrl = (possibleUrl: string): boolean => {
  try {
    /* eslint no-new: off */
    new URL(possibleUrl);
  } catch (_) {
    return false;
  }

  return true;
};
