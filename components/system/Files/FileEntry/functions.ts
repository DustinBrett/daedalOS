export const getIconByFileExtension = (extension: string): string => {
  switch (extension) {
    case '.img':
    case '.iso':
      return '/icons/image.png';
    case '.jsdos':
      return '/icons/compressed.png';
    default:
      return '/icons/unknown.png';
  }
};

export const getProcessByFileExtension = (extension: string): string => {
  switch (extension) {
    case '.img':
    case '.iso':
      return 'V86';
    case '.jsdos':
      return 'JSDOS';
    default:
      return '';
  }
};
