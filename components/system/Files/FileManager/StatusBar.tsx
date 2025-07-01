import { join } from "path";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTheme } from "styled-components";
import { type FileManagerViewNames } from "components/system/Files/Views";
import StyledStatusBar from "components/system/Files/FileManager/StyledStatusBar";
import { type FileDrop } from "components/system/Files/FileManager/useFileDrop";
import { useFileSystem } from "contexts/fileSystem";
import useResizeObserver from "hooks/useResizeObserver";
import { getFormattedSize, haltEvent, label } from "utils/functions";
import { UNKNOWN_SIZE } from "contexts/fileSystem/core";
import Icon from "styles/common/Icon";
import Button from "styles/common/Button";

type StatusBarProps = {
  count: number;
  directory: string;
  fileDrop: FileDrop;
  selected: string[];
  setView: (view: FileManagerViewNames) => void;
  view: FileManagerViewNames;
};

const UNCALCULATED_SIZE = -2;

const StatusBar: FC<StatusBarProps> = ({
  count,
  directory,
  fileDrop,
  selected,
  setView,
  view,
}) => {
  const { exists, lstat, stat } = useFileSystem();
  const [selectedSize, setSelectedSize] = useState(UNKNOWN_SIZE);
  const [showSelected, setShowSelected] = useState(false);
  const { sizes } = useTheme();
  const updateShowSelected = useCallback(
    (width: number): void =>
      setShowSelected(width > sizes.fileExplorer.minimumStatusBarWidth),
    [sizes.fileExplorer.minimumStatusBarWidth]
  );
  const statusBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateSelectedSize = async (): Promise<void> =>
      setSelectedSize(
        await selected.reduce(async (totalSize, file) => {
          const currentSize = await totalSize;

          if (currentSize === UNCALCULATED_SIZE) return UNCALCULATED_SIZE;

          const path = join(directory, file);

          try {
            if (await exists(path)) {
              return (await lstat(path)).isDirectory()
                ? UNCALCULATED_SIZE
                : (currentSize === UNKNOWN_SIZE ? 0 : currentSize) +
                    (await stat(path)).size;
            }
          } catch {
            // Ignore errors getting file sizes
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
  }, [updateShowSelected]);

  useResizeObserver(
    statusBarRef.current,
    useCallback<ResizeObserverCallback>(
      ([{ contentRect: { width = 0 } = {} }]) => updateShowSelected(width),
      [updateShowSelected]
    )
  );

  return (
    <StyledStatusBar
      ref={statusBarRef}
      onContextMenuCapture={haltEvent}
      {...fileDrop}
    >
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
      <nav className="views">
        <Button
          className={view === "details" ? "active" : undefined}
          onClick={() => setView("details")}
          {...label(
            "Displays information about each item\nin the window.  (Ctrl+Shift+6)"
          )}
        >
          <Icon
            displaySize={16}
            imgSize={16}
            src="/System/Icons/details_view.webp"
          />
        </Button>
        <Button
          className={view === "icon" ? "active" : undefined}
          onClick={() => setView("icon")}
          {...label(
            "Display items by using medium\nthumbnails.  (Ctrl+Shift+3)"
          )}
        >
          <Icon
            displaySize={16}
            imgSize={16}
            src="/System/Icons/icon_view.webp"
          />
        </Button>
      </nav>
    </StyledStatusBar>
  );
};

export default memo(StatusBar);
