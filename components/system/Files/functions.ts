export const getIconByFileExtension = (extension: string): string => {
  switch (extension) {
    case '.img':
    case '.iso':
      return '/icons/image.ico';
    default:
      return '/icons/unknown.ico';
  }
};

export const getProcessByFileExtension = (extension: string): string => {
  switch (extension) {
    case '.img':
    case '.iso':
      return 'V86';
    default:
      return '';
  }
};
