import StyledStatusBar from "components/system/Files/FileManager/StyledStatusBar";
import { useFileSystem } from "contexts/fileSystem";
import useResizeObserver from "hooks/useResizeObserver";
import { join } from "path";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { getFormattedSize, haltEvent, label } from "utils/functions";

type StatusBarProps = {
  count: number;
  directory: string;
  selected: string[];
};

const MINIMUM_STATUSBAR_WIDTH = 225;
const UNKNOWN_SIZE = -1;
const UNCALCULATED_SIZE = -2;

const StatusBar: FC<StatusBarProps> = ({ count, directory, selected }) => {
  const { exists, lstat, stat } = useFileSystem();
  const [selectedSize, setSelectedSize] = useState(UNKNOWN_SIZE);
  const [showSelected, setShowSelected] = useState(false);
  const updateShowSelected = (width: number): void =>
    setShowSelected(width > MINIMUM_STATUSBAR_WIDTH);
  const statusBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateSelectedSize = async (): Promise<void> =>
      setSelectedSize(
        await selected.reduce(async (totalSize, file) => {
          const currentSize = await totalSize;

          if (currentSize === UNCALCULATED_SIZE) return UNCALCULATED_SIZE;

          const path = join(directory, file);

          if (await exists(path)) {
            return (await lstat(path)).isDirectory()
              ? UNCALCULATED_SIZE
              : (currentSize === UNKNOWN_SIZE ? 0 : currentSize) +
                  (await stat(path)).size;
          }

          return totalSize;
        }, Promise.resolve(UNKNOWN_SIZE))
      );

    updateSelectedSize();
  }, [directory, exists, lstat, selected, stat]);

  useLayoutEffect(() => {
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
    <StyledStatusBar ref={statusBarRef} onContextMenuCapture={haltEvent}>
      <div {...label("Total item count")}>
        {count} item{count === 1 ? "" : "s"}
      </div>
      {showSelected && selected.length > 0 && (
        <div className="selected" {...label("Selected item count and size")}>
          {selected.length} item{selected.length === 1 ? "" : "s"} selected
          {selectedSize !== UNKNOWN_SIZE && selectedSize !== UNCALCULATED_SIZE
            ? `\u00A0\u00A0${getFormattedSize(selectedSize)}`
            : ""}
        </div>
      )}
    </StyledStatusBar>
  );
};

export default StatusBar;
