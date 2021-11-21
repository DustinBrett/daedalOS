import { sortFiles } from "components/system/Files/FileManager/functions";
import type { Files } from "components/system/Files/FileManager/useFolder";
import { useSession } from "contexts/session";
import { useState } from "react";

export type SortBy = "date" | "name" | "size" | "type";

export type SortByOrder = [SortBy, boolean];

export type SetSortBy = (sortBy: (current: SortByOrder) => SortByOrder) => void;

const useSortBy = (
  directory: string,
  files?: Files
): [SortByOrder, SetSortBy] => {
  const { setSortOrders } = useSession();
  const [currentSortBy, setCurrentSortBy] = useState<SortByOrder>([
    "name",
    true,
  ]);

  return [
    currentSortBy,
    (sortBy: (current: SortByOrder) => SortByOrder): void => {
      const newSortBy = sortBy(currentSortBy);
      const [sortByValue, isAscending] = newSortBy;

      if (files) {
        setSortOrders((currentSortOrder) => ({
          ...currentSortOrder,
          [directory]: Object.keys(
            sortFiles(directory, files, sortByValue, isAscending)
          ),
        }));
      }

      setCurrentSortBy(newSortBy);
    },
  ];
};

export default useSortBy;
