import type { RufflePlayer } from "components/apps/Ruffle/types";
import useTitle from "components/system/Window/useTitle";
import useWindowSize from "components/system/Window/useWindowSize";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename, extname } from "path";
import { useEffect, useState } from "react";
import { loadFiles } from "utils/functions";

const libs = ["/libs/ruffle/ruffle.js"];

const useRuffle = (
  id: string,
  containerElement: HTMLDivElement | null
): void => {
  const [player, setPlayer] = useState<RufflePlayer>();
  const { appendFileToTitle } = useTitle(id);
  const {
    processes: { [id]: { url = "" } = {} },
  } = useProcesses();
  const { updateWindowSize } = useWindowSize(id);
  const { fs } = useFileSystem();

  useEffect(() => {
    loadFiles(libs).then(() => {
      window.RufflePlayer.config = { polyfills: false };
      setPlayer(window.RufflePlayer?.newest()?.createPlayer());
    });
  }, []);

  useEffect(() => {
    if (containerElement && fs && player) {
      containerElement.appendChild(player);

      fs.readFile(url, (error, contents = Buffer.from("")) => {
        if (!error) {
          player
            .load({
              allowScriptAccess: false,
              data: contents,
            })
            .then(() => {
              const { height = 0, width = 0 } =
                player?.shadowRoot
                  ?.querySelector("canvas")
                  ?.getBoundingClientRect() || {};

              updateWindowSize(height, width);
              appendFileToTitle(basename(url, extname(url)));
            });
        }
      });
    }

    return () => player?.remove();
  }, [appendFileToTitle, containerElement, fs, player, updateWindowSize, url]);
};

export default useRuffle;
