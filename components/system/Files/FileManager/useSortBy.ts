import { sortFiles } from "components/system/Files/FileManager/functions";
import type { Files } from "components/system/Files/FileManager/useFolder";
import { useEffect, useState } from "react";

export type SortBy = "" | "name" | "size" | "type" | "date";

const useSortBy = (
  setFiles: React.Dispatch<React.SetStateAction<Files | undefined>>
): React.Dispatch<React.SetStateAction<SortBy>> => {
  const [sortBy, setSortBy] = useState<SortBy>("");

  useEffect(() => {
    if (sortBy) {
      setFiles((currentFiles = {}) => sortFiles(currentFiles, sortBy));
      setSortBy("");
    }
  }, [setFiles, sortBy]);

  return setSortBy;
};

export default useSortBy;
