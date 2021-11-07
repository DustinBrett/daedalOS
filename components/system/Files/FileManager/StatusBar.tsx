import StyledStatusBar from "components/system/Files/FileManager/StyledStatusBar";
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
  const { exists, stat } = useFileSystem();
  const [selectedSize, setSelectedSize] = useState(0);
  const updateSelectedSize = useCallback(async (): Promise<void> => {
    let totalSize = -1;

    for (const file of selected) {
      const path = join(directory, file);

      /* eslint-disable no-await-in-loop */
      if (await exists(path)) {
        const stats = await stat(path);

        if (stats.isDirectory()) {
          totalSize = -1;
          break;
        }

        totalSize = totalSize === -1 ? stats.size : totalSize + stats.size;
      }
      /* eslint-enable no-await-in-loop */
    }

    setSelectedSize(totalSize);
  }, [directory, exists, selected, stat]);

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
