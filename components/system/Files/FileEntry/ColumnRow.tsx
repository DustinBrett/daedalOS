import type Stats from "browserfs/dist/node/core/node_fs_stats";
import { memo, useCallback, useEffect, useRef, useState } from "react";
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

const ColumnRow: FC<{
  columns: Columns;
  isDirectory: boolean;
  path: string;
  stats: Stats;
}> = ({ columns, isDirectory, path, stats }) => {
  const { stat } = useFileSystemActions();
  const { formats } = useTheme();
  const getColumnData = useCallback(async (): Promise<ColumnDataProps> => {
    const fullStats = stats.size === UNKNOWN_SIZE ? await stat(path) : stats;

    return {
      date: getDateModified(path, fullStats, formats.dateModified),
      size: isDirectory ? "" : getFormattedSize(fullStats.size, true),
      type: isDirectory ? "File folder" : getFileType(getExtension(path)),
    };
  }, [formats.dateModified, isDirectory, path, stat, stats]);
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
    <StyledColumnRow>
      <div style={{ width: columns?.date.width }}>{columnData?.date}</div>
      <div style={{ width: columns?.type.width }}>{columnData?.type}</div>
      <div style={{ width: columns?.size.width }}>{columnData?.size}</div>
    </StyledColumnRow>
  );
};

export default memo(ColumnRow);
