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
  const [, sessionSortBy, sessionAscending] = useSortOrder(directory);
  const currentSortBy: SortByOrder =
    typeof sessionSortBy === "string" && typeof sessionAscending === "boolean"
      ? [sessionSortBy, sessionAscending]
      : DEFAULT_SORT_BY;

  return [
    currentSortBy,
    (sortBy: (current: SortByOrder) => SortByOrder): void => {
      const [sortByValue, isAscending] = sortBy(currentSortBy);

      if (files) {
        setSortOrder(
          directory,
          Object.keys(sortFiles(directory, files, sortByValue, isAscending)),
          sortByValue,
          isAscending
        );
      }
    },
  ];
};

export default useSortBy;
