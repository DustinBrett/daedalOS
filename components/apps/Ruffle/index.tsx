import StyledRuffle from "components/apps/Ruffle/StyledRuffle";
import type { RufflePlayer } from "components/apps/Ruffle/types";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import useTitle from "components/system/Window/useTitle";
import useWindowSize from "components/system/Window/useWindowSize";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename, extname } from "path";
import { useEffect, useRef, useState } from "react";
import { bufferToUrl, loadFiles } from "utils/functions";

const libs = ["/libs/ruffle/ruffle.js"];

const Ruffle = ({ id }: ComponentProcessProps): JSX.Element => {
  const { appendFileToTitle } = useTitle(id);
  const {
    processes: { [id]: { url = "" } = {} },
  } = useProcesses();
  const { updateWindowSize } = useWindowSize(id);
  const { fs } = useFileSystem();
  const [player, setPlayer] = useState<RufflePlayer>();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadFiles(libs).then(() =>
      setPlayer(window.RufflePlayer?.newest()?.createPlayer())
    );
  }, []);

  useEffect(() => {
    if (fs && player) {
      containerRef.current?.appendChild(player);

      fs.readFile(url, (error, contents = Buffer.from("")) => {
        if (!error) {
          player.load(bufferToUrl(contents)).then(() => {
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
  }, [appendFileToTitle, fs, player, updateWindowSize, url]);

  return <StyledRuffle ref={containerRef} />;
};

export default Ruffle;
