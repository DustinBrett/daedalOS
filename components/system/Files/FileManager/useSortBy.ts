import { sortFiles } from "components/system/Files/FileManager/functions";
import type { Files } from "components/system/Files/FileManager/useFolder";
import { useSession } from "contexts/session";

type SortTypes = "date" | "name" | "size" | "type";

export type SortBy = SortTypes | `!${SortTypes}`;

export type SetSortBy = (value: SortTypes) => void;

const useSortBy = (directory: string, files?: Files): SetSortBy => {
  const { setSortOrders } = useSession();

  return (sortBy: SortTypes): void => {
    if (files) {
      setSortOrders((currentSortOrder) => ({
        ...currentSortOrder,
        [directory]: Object.keys(sortFiles(files, sortBy)),
      }));
    }
  };
};

export default useSortBy;
