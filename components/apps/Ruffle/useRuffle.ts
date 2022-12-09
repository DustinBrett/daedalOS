import type { RufflePlayer } from "components/apps/Ruffle/types";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename, extname } from "path";
import { useCallback, useEffect, useState } from "react";
import { loadFiles } from "utils/functions";

const useRuffle = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  const { processes: { [id]: { libs = [] } = {} } = {} } = useProcesses();
  const [player, setPlayer] = useState<RufflePlayer>();
  const { appendFileToTitle } = useTitle(id);
  const { readFile } = useFileSystem();
  const loadFlash = useCallback(async () => {
    containerRef.current?.classList.remove("drop");
    await player?.load({ data: await readFile(url) });
    appendFileToTitle(basename(url, extname(url)));
  }, [appendFileToTitle, containerRef, player, readFile, url]);

  useEffect(() => {
    loadFiles(libs).then(() => {
      if (window.RufflePlayer) {
        window.RufflePlayer.config = {
          allowScriptAccess: false,
          autoplay: true,
          backgroundColor: "#000000",
          letterbox: "on",
          polyfills: false,
          preloader: false,
        };
        setPlayer(window.RufflePlayer.newest().createPlayer());
        if (!url) containerRef.current?.classList.add("drop");
      }
    });
  }, [containerRef, libs, url]);

  useEffect(() => {
    if (containerRef.current && player) {
      containerRef.current.append(player);
      setLoading(false);
    }

    return () => player?.remove();
  }, [containerRef, player, setLoading]);

  useEffect(() => {
    if (containerRef.current && player && url) loadFlash();
  }, [containerRef, loadFlash, player, url]);
};

export default useRuffle;
