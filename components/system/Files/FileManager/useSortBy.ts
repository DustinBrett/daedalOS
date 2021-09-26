import { sortFiles } from "components/system/Files/FileManager/functions";
import type { Files } from "components/system/Files/FileManager/useFolder";
import { useEffect, useState } from "react";

type SortTypes = "name" | "size" | "type" | "date";

export type SortBy = SortTypes | `!${SortTypes}`;

export type SetSortBy = (value: SortTypes) => void;

const useSortBy = (
  setFiles: React.Dispatch<React.SetStateAction<Files | undefined>>
): SetSortBy => {
  const [sortBy, setSortByDispatch] = useState<SortBy | undefined>();
  const setSortBy = (value: SortTypes): void =>
    setSortByDispatch((currentSortBy) =>
      currentSortBy === value ? `!${value}` : value
    );

  useEffect(() => {
    if (sortBy) {
      setFiles((currentFiles = {}) => {
        const reverseOrder = sortBy.startsWith("!");
        const sortByType = reverseOrder ? (sortBy.slice(1) as SortBy) : sortBy;
        const sortedFiles = sortFiles(currentFiles, sortByType);

        return reverseOrder
          ? Object.fromEntries(Object.entries(sortedFiles).reverse())
          : sortedFiles;
      });
    }
  }, [setFiles, sortBy]);

  return setSortBy;
};

export default useSortBy;
