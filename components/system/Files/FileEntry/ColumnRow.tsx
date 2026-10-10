import type Stats from "browserfs/dist/node/core/node_fs_stats";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";
import {
  getDateModified,
  getFileType,
} from "components/system/Files/FileEntry/functions";
import StyledColumnRow from "components/system/Files/FileEntry/StyledColumnRow";
import { type Columns } from "components/system/Files/FileManager/Columns/constants";
import { useFileSystemActions } from "contexts/fileSystem";
import { UNKNOWN_SIZE } from "contexts/fileSystem/core";
import { getExtension, getFormattedSize } from "utils/functions";

type ColumnDataProps = {
  date: string;
  size: string;
  type: string;
};

const DATA_COLUMNS: (keyof ColumnDataProps)[] = ["date", "type", "size"];

const ColumnRow: FC<{
  columns: Columns;
  id: string;
  isDirectory: boolean;
  path: string;
  stats: Stats;
}> = ({ columns, id, isDirectory, path, stats }) => {
  const { stat } = useFileSystemActions();
  const { formats } = useTheme();
  const getColumnData = async (): Promise<ColumnDataProps> => {
    const fullStats = stats.size === UNKNOWN_SIZE ? await stat(path) : stats;

    return {
      date: getDateModified(path, fullStats, formats.dateModified),
      size: isDirectory ? "" : getFormattedSize(fullStats.size, true),
      type: isDirectory ? "File folder" : getFileType(getExtension(path)),
    };
  };
  const [columnData, setColumnData] = useState<ColumnDataProps>();
  const creatingRef = useRef(false);

  useEffect(() => {
    if (!columnData && !creatingRef.current) {
      creatingRef.current = true;
      getColumnData().then((newColumnData) => {
        setColumnData(newColumnData);
        creatingRef.current = false;
      });
    }
  }, [columnData, getColumnData]);

  return (
    <StyledColumnRow id={id}>
      {DATA_COLUMNS.map((column, index) => (
        <div key={column} style={{ width: columns?.[column].width }}>
          {/* Like Explorer, each value is read with its column name */}
          {columnData?.[column] && (
            <span className="label">
              {`${index > 0 ? ", " : ""}${columns?.[column].name}: `}
            </span>
          )}
          {columnData?.[column]}
        </div>
      ))}
    </StyledColumnRow>
  );
};

export default ColumnRow;
