import { basename, extname } from "path";
import { useCallback, useEffect, useState } from "react";
import { type RufflePlayer } from "components/apps/Ruffle/types";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { loadFiles } from "utils/functions";

const useRuffle = ({
  containerRef,
  id,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const {
    argument,
    linkElement,
    processes: { [id]: { libs = [] } = {} } = {},
  } = useProcesses();
  const [player, setPlayer] = useState<RufflePlayer>();
  const { appendFileToTitle } = useTitle(id);
  const { readFile } = useFileSystem();
  const loadFlash = useCallback(async () => {
    containerRef.current?.classList.remove("drop");

    try {
      await player?.load({ data: await readFile(url) });
    } catch {
      // Ruffle handles error reporting
    } finally {
      setLoading(false);
    }

    appendFileToTitle(basename(url, extname(url)));
  }, [appendFileToTitle, containerRef, player, readFile, setLoading, url]);

  useEffect(() => {
    loadFiles(libs).then(() => {
      if (window.RufflePlayer) {
        window.RufflePlayer.config = {
          allowScriptAccess: false,
          autoplay: "on",
          backgroundColor: "#000000",
          letterbox: "on",
          menu: false,
          polyfills: false,
          preloader: false,
          unmuteOverlay: "hidden",
        };

        setPlayer(window.RufflePlayer.newest().createPlayer());

        if (!url) {
          containerRef.current?.classList.add("drop");
          setLoading(false);
        }
      }
    });
  }, [containerRef, libs, setLoading, url]);

  useEffect(() => {
    if (containerRef.current && player) {
      containerRef.current.append(player);
      linkElement(id, "peekElement", player);
      argument(id, "play", () => {
        player.play();
        argument(id, "paused", false);
      });
      argument(id, "pause", () => {
        player.pause();
        argument(id, "paused", true);
      });
      player.addEventListener("click", () =>
        argument(id, "paused", !player?.isPlaying)
      );
    }

    return () => player?.remove();
  }, [argument, containerRef, id, linkElement, player]);

  useEffect(() => {
    if (containerRef.current && player && url) loadFlash();
  }, [containerRef, loadFlash, player, url]);
};

export default useRuffle;
