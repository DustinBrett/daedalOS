import StyledStatusBar from "components/system/Files/FileManager/StyledStatusBar";
import { useFileSystem } from "contexts/fileSystem";
import useResizeObserver from "hooks/useResizeObserver";
import { join } from "path";
import { useCallback, useEffect, useRef, useState } from "react";
import { getFormattedSize } from "utils/functions";

type StatusBarProps = {
  count: number;
  directory: string;
  selected: string[];
};

const MINIMUM_STATUSBAR_WIDTH = 225;

const StatusBar = ({
  count,
  directory,
  selected,
}: StatusBarProps): JSX.Element => {
  const { exists, stat } = useFileSystem();
  const [selectedSize, setSelectedSize] = useState(0);
  const [showSelected, setShowSelected] = useState(false);
  const updateShowSelected = (width: number): void =>
    setShowSelected(width > MINIMUM_STATUSBAR_WIDTH);
  const statusBarRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    if (statusBarRef.current) {
      updateShowSelected(statusBarRef.current.getBoundingClientRect().width);
    }
  }, []);

  useResizeObserver(
    statusBarRef.current,
    useCallback<ResizeObserverCallback>(
      ([{ contentRect: { width = 0 } = {} }]) => updateShowSelected(width),
      []
    )
  );

  return (
    <StyledStatusBar ref={statusBarRef}>
      <div title="Total item count">
        {count} item{count !== 1 ? "s" : ""}
      </div>
      {showSelected && selected.length > 0 && (
        <div className="selected" title="Selected item count and size">
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
