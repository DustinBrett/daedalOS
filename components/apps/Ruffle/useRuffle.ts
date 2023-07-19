import type { RufflePlayer } from "components/apps/Ruffle/types";
import type { ContainerHookProps } from "components/system/Apps/AppContainer";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename, extname } from "path";
import { useCallback, useEffect, useState } from "react";
import { loadFiles } from "utils/functions";

const useRuffle = ({
  containerRef,
  id,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const { linkElement, processes: { [id]: { libs = [] } = {} } = {} } =
    useProcesses();
  const [player, setPlayer] = useState<RufflePlayer>();
  const { appendFileToTitle } = useTitle(id);
  const { readFile } = useFileSystem();
  const loadFlash = useCallback(async () => {
    containerRef.current?.classList.remove("drop");
    try {
      await player?.load({ data: await readFile(url) });
    } catch {
      // Ruffle handles error reporting
    }

    appendFileToTitle(basename(url, extname(url)));
  }, [appendFileToTitle, containerRef, player, readFile, url]);

  useEffect(() => {
    loadFiles(libs).then(() => {
      if (window.RufflePlayer) {
        window.RufflePlayer.config = {
          allowScriptAccess: false,
          autoplay: "on",
          backgroundColor: "#000000",
          letterbox: "on",
          polyfills: false,
          preloader: false,
          unmuteOverlay: "hidden",
        };
        setPlayer(window.RufflePlayer.newest().createPlayer());
        if (!url) containerRef.current?.classList.add("drop");
      }
    });
  }, [containerRef, libs, url]);

  useEffect(() => {
    if (containerRef.current && player) {
      containerRef.current.append(player);
      linkElement(id, "peekElement", player);
      setLoading(false);
    }

    return () => player?.remove();
  }, [containerRef, id, linkElement, player, setLoading]);

  useEffect(() => {
    if (containerRef.current && player && url) loadFlash();
  }, [containerRef, loadFlash, player, url]);
};

export default useRuffle;
