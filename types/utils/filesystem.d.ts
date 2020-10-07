export type FileStat = {
  size: number;
  mtime: string;
};

export type ListingStat = {
  [key: string]: FileStat;
};

export type ListingObj = {
  [key: string]: ListingObj | null;
};
