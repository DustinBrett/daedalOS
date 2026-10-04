import dynamic from "next/dynamic";
import { memo, useCallback, useRef } from "react";
import { useTheme } from "styled-components";
import {
  type ColumnName,
  type Columns as ColumnsObject,
  DEFAULT_COLUMN_ORDER,
  MAX_STEPS_PER_RESIZE,
} from "components/system/Files/FileManager/Columns/constants";
import StyledColumns from "components/system/Files/FileManager/Columns/StyledColumns";
import { sortFiles } from "components/system/Files/FileManager/functions";
import { type Files } from "components/system/Files/FileManager/useFolder";
import { type SortBy } from "components/system/Files/FileManager/useSortBy";
import { useSessionActions, useSortOrder } from "contexts/session";

const Down = dynamic(() =>
  import("components/apps/FileExplorer/NavigationIcons").then((mod) => mod.Down)
);

type ColumnsProps = {
  columns: ColumnsObject;
  directory: string;
  files: Files;
  id?: string;
  setColumns: React.Dispatch<React.SetStateAction<ColumnsObject | undefined>>;
};

const Columns: FC<ColumnsProps> = ({
  columns,
  directory,
  files,
  id,
  setColumns,
}) => {
  const { sizes } = useTheme();
  const draggingRef = useRef("");
  const lastClientX = useRef(0);
  const { setSortOrder, setWindowStates } = useSessionActions();
  const [, sortedBy = "name", ascending] = useSortOrder(directory);
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
      const dragName = draggingRef.current as ColumnName;
      const movement = event.clientX - lastClientX.current;

      if (
        !dragName ||
        Math.abs(movement) > MAX_STEPS_PER_RESIZE ||
        columns[dragName].width + movement < sizes.fileManager.columnMinWidth
      ) {
        return;
      }

      lastClientX.current = event.clientX;

      setColumns(
        (currentColumns) =>
          currentColumns && {
            ...currentColumns,
            [dragName]: {
              ...currentColumns[dragName],
              width: currentColumns[dragName].width + movement,
            },
          }
      );
    },
    [columns, setColumns, sizes.fileManager.columnMinWidth]
  );
  const onPointerUpCapture = useCallback(
    (name: string) => (event: React.PointerEvent<HTMLLIElement>) => {
      if (event.button !== 0) return;

      if (draggingRef.current) {
        draggingRef.current = "";
        lastClientX.current = 0;

        if (id) {
          setWindowStates((currentWindowStates) => ({
            ...currentWindowStates,
            [id]: { ...currentWindowStates[id], columns },
          }));
        }
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
    [ascending, columns, directory, files, id, setSortOrder, setWindowStates]
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
            <span aria-hidden="true" className="resize" />
          </li>
        ))}
      </ol>
    </StyledColumns>
  );
};

export default memo(Columns);
