import StyledStatusBar from "components/system/Files/FileManager/StyledStatusBar";
import { useFileSystem } from "contexts/fileSystem";
import useResizeObserver from "hooks/useResizeObserver";
import { join } from "path";
import { useCallback, useEffect, useRef, useState } from "react";
import { getFormattedSize, label } from "utils/functions";

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
  const updateSelectedSize = useCallback(
    async (): Promise<void> =>
      setSelectedSize(
        await selected.reduce(async (totalSize, file) => {
          const currentSize = await totalSize;

          if (currentSize === -1) return -1;

          const path = join(directory, file);

          if (await exists(path)) {
            const stats = await stat(path);

            return stats.isDirectory() ? -1 : currentSize + stats.size;
          }

          return totalSize;
        }, Promise.resolve(0))
      ),
    [directory, exists, selected, stat]
  );

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
      <div {...label("Total item count")}>
        {count} item{count !== 1 ? "s" : ""}
      </div>
      {showSelected && selected.length > 0 && (
        <div className="selected" {...label("Selected item count and size")}>
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
