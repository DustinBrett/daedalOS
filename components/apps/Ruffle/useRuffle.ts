import type { RufflePlayer } from "components/apps/Ruffle/types";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { basename, extname } from "path";
import { useEffect, useState } from "react";
import { EMPTY_BUFFER } from "utils/constants";
import { loadFiles } from "utils/functions";

const libs = ["/Program Files/Ruffle/ruffle.js"];

const useRuffle = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>
): void => {
  const [player, setPlayer] = useState<RufflePlayer>();
  const { appendFileToTitle } = useTitle(id);
  const { fs } = useFileSystem();

  useEffect(() => {
    loadFiles(libs).then(() => {
      if (window.RufflePlayer) {
        window.RufflePlayer.config = {
          backgroundColor: "#000000",
          letterbox: "on",
          polyfills: false,
        };
        setPlayer(window.RufflePlayer.newest().createPlayer());
      }
    });
  }, []);

  useEffect(() => {
    if (containerRef.current && fs && player) {
      containerRef.current.appendChild(player);

      fs.readFile(url, (error, contents = EMPTY_BUFFER) => {
        if (!error) {
          player
            .load({ data: contents })
            .then(() => appendFileToTitle(basename(url, extname(url))));
        }
      });
    }

    return () => player?.remove();
  }, [appendFileToTitle, containerRef, fs, player, url]);
};

export default useRuffle;
