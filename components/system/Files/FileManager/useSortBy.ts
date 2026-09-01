import { useEffect, useMemo, useState } from "react";
import { sortFiles } from "components/system/Files/FileManager/functions";
import { type Files } from "components/system/Files/FileManager/useFolder";
import { useSessionActions, useSortOrder } from "contexts/session";

export type SortBy = "date" | "name" | "size" | "type";

export type SortByOrder = [SortBy, boolean];

export type SetSortBy = (sortBy: (current: SortByOrder) => SortByOrder) => void;

const DEFAULT_SORT_BY = ["name", true] as SortByOrder;

const useSortBy = (
  directory: string,
  files?: Files
): [SortByOrder, SetSortBy] => {
  const { setSortOrder } = useSessionActions();
  const sortOrder = useSortOrder(directory);
  const [currentSortBy, setCurrentSortBy] = useState<
    Record<string, SortByOrder>
  >({
    [directory]: DEFAULT_SORT_BY,
  });

  useEffect(() => {
    const [, sessionSortBy, sessionAscending] = sortOrder;

    if (
      typeof sessionSortBy === "string" &&
      typeof sessionAscending === "boolean"
    ) {
      setCurrentSortBy({ [directory]: [sessionSortBy, sessionAscending] });
    }
  }, [directory, sortOrder]);

  return useMemo(
    () => [
      currentSortBy[directory] || DEFAULT_SORT_BY,
      (sortBy: (current: SortByOrder) => SortByOrder): void => {
        const newSortBy = sortBy(currentSortBy[directory] || DEFAULT_SORT_BY);
        const [sortByValue, isAscending] = newSortBy;

        if (files) {
          setSortOrder(
            directory,
            Object.keys(sortFiles(directory, files, sortByValue, isAscending)),
            sortByValue,
            isAscending
          );
        }
      },
    ],
    [currentSortBy, directory, files, setSortOrder]
  );
};

export default useSortBy;
