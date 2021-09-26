import {
  config,
  getVideoType,
  libs,
  ytLib,
} from "components/apps/VideoPlayer/config";
import type { VideoPlayer } from "components/apps/VideoPlayer/types";
import useTitle from "components/system/Window/useTitle";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useEffect, useState } from "react";
import { EMPTY_BUFFER } from "utils/constants";
import { bufferToUrl, cleanUpBufferUrl, loadFiles } from "utils/functions";

const isYouTubeUrl = (url: string): boolean =>
  url.includes("youtube.com/") || url.includes("youtu.be/");

const useVideoPlayer = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>
): void => {
  const { fs } = useFileSystem();
  const {
    processes: { [id]: { closing = false } = {} },
  } = useProcesses();
  const [player, setPlayer] = useState<VideoPlayer>();
  const { appendFileToTitle } = useTitle(id);

  useEffect(() => {
    if (url) {
      const isYT = isYouTubeUrl(url);
      const [videoElement] = containerRef.current
        ?.childNodes as NodeListOf<HTMLVideoElement>;
      const type = isYT ? "video/youtube" : getVideoType(url) || "video/mp4";
      const loadPlayer = (src: string): void => {
        const sources = [{ src, type }];

        if (player) {
          player.src(sources);
        } else {
          setPlayer(
            window.videojs(videoElement, {
              ...config,
              ...(isYT
                ? { techOrder: ["youtube"], youtube: { ytControls: 2 } }
                : { controls: true }),
              sources,
            })
          );
        }

        if (!isYT) {
          appendFileToTitle(url);
          cleanUpBufferUrl(url);
        }
      };

      loadFiles(isYT ? [...libs, ytLib] : libs).then(() => {
        if (isYT) {
          loadPlayer(url);
        } else {
          fs?.readFile(url, (_error, contents = EMPTY_BUFFER) =>
            loadPlayer(bufferToUrl(contents))
          );
        }
      });
    }
  }, [appendFileToTitle, containerRef, fs, player, url]);

  useEffect(
    () => () => {
      if (closing) player?.dispose();
    },
    [closing, player]
  );
};

export default useVideoPlayer;
