import { memo, useCallback, useRef } from "react";
import { useTheme } from "styled-components";
import dynamic from "next/dynamic";
import { sortFiles } from "components/system/Files/FileManager/functions";
import { type SortBy } from "components/system/Files/FileManager/useSortBy";
import StyledColumns from "components/system/Files/FileManager/Columns/StyledColumns";
import {
  DEFAULT_COLUMN_ORDER,
  MAX_STEPS_PER_RESIZE,
  type ColumnName,
  type Columns as ColumnsObject,
} from "components/system/Files/FileManager/Columns/constants";
import { useSession } from "contexts/session";
import { type Files } from "components/system/Files/FileManager/useFolder";

const Down = dynamic(() =>
  import("components/apps/FileExplorer/NavigationIcons").then((mod) => mod.Down)
);

type ColumnsProps = {
  columns: ColumnsObject;
  directory: string;
  files: Files;
  setColumns: React.Dispatch<React.SetStateAction<ColumnsObject | undefined>>;
};

const Columns: FC<ColumnsProps> = ({
  columns,
  directory,
  files,
  setColumns,
}) => {
  const { sizes } = useTheme();
  const draggingRef = useRef("");
  const lastClientX = useRef(0);
  const { setSortOrder, sortOrders } = useSession();
  const [, sortedBy = "name", ascending] = sortOrders[directory] ?? [];
  const onPointerDownCapture = useCallback(
    (name: string) => (event: React.PointerEvent<HTMLLIElement>) => {
      if (event.button !== 0) return;

      draggingRef.current =
        (event.target as HTMLElement).className === "resize" ? name : "";
      lastClientX.current = event.clientX;
    },
    []
  );
  const onPointerMoveCapture = useCallback(
    (event: React.PointerEvent<HTMLLIElement>) => {
      if (draggingRef.current) {
        const dragName = draggingRef.current as ColumnName;

        setColumns((currentColumns) => {
          if (!currentColumns?.[dragName]) return currentColumns;

          const newColumns = { ...currentColumns };
          const newSize =
            newColumns[dragName].width + event.clientX - lastClientX.current;

          if (
            newSize < sizes.fileManager.columnMinWidth ||
            Math.abs(lastClientX.current - event.clientX) > MAX_STEPS_PER_RESIZE
          ) {
            return newColumns;
          }

          newColumns[dragName].width = newSize;
          lastClientX.current = event.clientX;

          return newColumns;
        });
      }
    },
    [setColumns, sizes.fileManager.columnMinWidth]
  );
  const onPointerUpCapture = useCallback(
    (name: string) => (event: React.PointerEvent<HTMLLIElement>) => {
      if (event.button !== 0) return;

      if (draggingRef.current) {
        draggingRef.current = "";
        lastClientX.current = 0;
      } else {
        const sortBy = name as SortBy;

        setSortOrder(
          directory,
          Object.keys(sortFiles(directory, files, sortBy, !ascending)),
          sortBy,
          !ascending
        );
      }
    },
    [ascending, directory, files, setSortOrder]
  );

  return (
    <StyledColumns>
      <ol>
        {DEFAULT_COLUMN_ORDER.map((name) => (
          <li
            key={columns[name].name}
            onPointerDownCapture={onPointerDownCapture(name)}
            onPointerMoveCapture={onPointerMoveCapture}
            onPointerUpCapture={onPointerUpCapture(name)}
            style={{ width: `${columns[name].width}px` }}
          >
            {sortedBy === name && <Down flip={ascending} />}
            <div className="name">{columns[name].name}</div>
            <span className="resize" />
          </li>
        ))}
      </ol>
    </StyledColumns>
  );
};

export default memo(Columns);
