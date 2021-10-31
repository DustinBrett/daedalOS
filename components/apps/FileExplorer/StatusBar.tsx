import StyledStatusBar from "components/apps/FileExplorer/StyledStatusBar";
import { useFileSystem } from "contexts/fileSystem";
import { join } from "path";
import { useCallback, useEffect, useState } from "react";
import { getFormattedSize } from "utils/functions";

type StatusBarProps = {
  count: number;
  directory: string;
  selected: string[];
};

const StatusBar = ({
  count,
  directory,
  selected,
}: StatusBarProps): JSX.Element => {
  const { stat } = useFileSystem();
  const [selectedSize, setSelectedSize] = useState(-1);
  const updateSelectedSize = useCallback(async (): Promise<void> => {
    let totalSize = 0;

    for (const file of selected) {
      // eslint-disable-next-line no-await-in-loop
      const stats = await stat(join(directory, file));

      if (stats.isDirectory()) {
        totalSize = -1;
        break;
      }

      totalSize += stats.size;
    }

    setSelectedSize(totalSize);
  }, [directory, selected, stat]);

  useEffect(() => {
    updateSelectedSize();
  }, [selected, updateSelectedSize]);

  return (
    <StyledStatusBar>
      <div title="Total item count">
        {count} item{count !== 1 ? "s" : ""}
      </div>
      {selected.length > 0 && (
        <div title="Selected item count and size">
          {selected.length} item{selected.length !== 1 ? "s" : ""} selected
          {selectedSize > -1
            ? `${"\u00A0\u00A0"}${getFormattedSize(selectedSize)}`
            : ""}
        </div>
      )}
    </StyledStatusBar>
  );
};

export default StatusBar;
