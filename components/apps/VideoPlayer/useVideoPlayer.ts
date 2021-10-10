import {
  config,
  getVideoType,
  libs,
  ytLib,
} from "components/apps/VideoPlayer/config";
import useTitle from "components/system/Window/useTitle";
import useWindowSize from "components/system/Window/useWindowSize";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useEffect, useState } from "react";
import { EMPTY_BUFFER } from "utils/constants";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  loadFiles,
  viewHeight,
  viewWidth,
} from "utils/functions";
import type videojs from "video.js";

const isYouTubeUrl = (url: string): boolean =>
  url.includes("youtube.com/") || url.includes("youtu.be/");

const useVideoPlayer = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loading: boolean
): void => {
  const { fs } = useFileSystem();
  const {
    processes: { [id]: { closing = false } = {} },
  } = useProcesses();
  const { updateWindowSize } = useWindowSize(id);
  const [player, setPlayer] = useState<ReturnType<typeof videojs>>();
  const { appendFileToTitle } = useTitle(id);

  useEffect(() => {
    if (loading) loadFiles(libs).then(() => setLoading(false));
  }, [loading, setLoading]);

  useEffect(() => {
    if (!loading) {
      const isYT = isYouTubeUrl(url);
      const loadPlayer = (src?: string): void => {
        const [videoElement] = containerRef.current
          ?.childNodes as NodeListOf<HTMLVideoElement>;

        if (player) {
          if (src && url) {
            player.src([
              {
                src,
                type: isYT ? "video/youtube" : getVideoType(url) || "video/mp4",
              },
            ]);
          }

          player.on("firstplay", () => {
            const [height, width] = [player.videoHeight(), player.videoWidth()];
            const [vh, vw] = [viewHeight(), viewWidth()];

            if (height && width) {
              if (height > vh || width > vw) {
                updateWindowSize(vw * (height / width), vw);
              } else {
                updateWindowSize(height, width);
              }
            }
          });
        } else {
          setPlayer(
            window.videojs(videoElement, {
              ...config,
              ...(isYT
                ? { techOrder: ["youtube"], youtube: { ytControls: 2 } }
                : { controls: true, inactivityTimeout: 1000 }),
            })
          );
        }

        if (url && !isYT) {
          appendFileToTitle(url);
          cleanUpBufferUrl(url);
        }
      };

      if (url) {
        if (isYT) {
          loadFiles([ytLib]).then(() => loadPlayer(url));
        } else {
          fs?.readFile(url, (_error, contents = EMPTY_BUFFER) =>
            loadPlayer(bufferToUrl(contents))
          );
        }
      } else {
        loadPlayer();
      }
    }
  }, [
    appendFileToTitle,
    containerRef,
    fs,
    loading,
    player,
    updateWindowSize,
    url,
  ]);

  useEffect(
    () => () => {
      if (closing) player?.dispose();
    },
    [closing, player]
  );
};

export default useVideoPlayer;
