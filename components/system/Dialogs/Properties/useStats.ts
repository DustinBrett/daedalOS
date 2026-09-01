import { useEffect, useState } from "react";
import type Stats from "browserfs/dist/node/core/node_fs_stats";
import { useFileSystemActions } from "contexts/fileSystem";

const useStats = (url: string): Stats | undefined => {
  const { stat } = useFileSystemActions();
  const [stats, setStats] = useState<Stats>();

  useEffect(() => {
    if (!stats && url) stat(url).then(setStats);
  }, [stat, stats, url]);

  return stats;
};

export default useStats;
