export const lockDocumentTitle = (): void => {
  if (
    typeof Object.getOwnPropertyDescriptor(document, 'title')?.set ===
    'undefined'
  ) {
    Object.defineProperty(document, 'title', { set: () => {} });
  }
};

export const isValidUrl = (possibleUrl: string): boolean => {
  try {
    new URL(possibleUrl);
  } catch (_) {
    return false;
  }

  return true;
};
