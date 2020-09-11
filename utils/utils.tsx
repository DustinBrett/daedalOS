export const lockDocumentTitle = (): void => {
  if (
    typeof Object.getOwnPropertyDescriptor(document, 'title')?.set ===
    'undefined'
  ) {
    Object.defineProperty(document, 'title', { set: () => {} });
  }
};
