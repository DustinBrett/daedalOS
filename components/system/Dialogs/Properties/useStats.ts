import { useEffect, useState } from "react";
import type Stats from "browserfs/dist/node/core/node_fs_stats";
import { useFileSystem } from "contexts/fileSystem";

const useStats = (url: string): Stats | undefined => {
  const { stat } = useFileSystem();
  const [stats, setStats] = useState<Stats>();

  useEffect(() => {
    if (!stats && url) stat(url).then(setStats);
  }, [stat, stats, url]);

  return stats;
};

export default useStats;
