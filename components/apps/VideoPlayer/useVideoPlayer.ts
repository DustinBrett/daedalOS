import {
  config,
  getVideoType,
  libs,
  YT_TYPE,
} from "components/apps/VideoPlayer/config";
import type {
  SourceObjectWithUrl,
  VideoPlayer,
} from "components/apps/VideoPlayer/types";
import useTitle from "components/system/Window/useTitle";
import useWindowSize from "components/system/Window/useWindowSize";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useCallback, useEffect, useState } from "react";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  loadFiles,
  viewHeight,
  viewWidth,
} from "utils/functions";

export const isYouTubeUrl = (url: string): boolean =>
  url.includes("youtube.com/") || url.includes("youtu.be/");

const useVideoPlayer = (
  id: string,
  url: string,
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loading: boolean
): void => {
  const { readFile } = useFileSystem();
  const {
    processes: { [id]: { closing = false } = {} },
  } = useProcesses();
  const { updateWindowSize } = useWindowSize(id);
  const [player, setPlayer] = useState<VideoPlayer>();
  const { appendFileToTitle } = useTitle(id);
  const cleanUpSource = useCallback((): void => {
    const { src: sources = [] } = player?.getMedia() || {};

    if (Array.isArray(sources) && sources.length > 0) {
      const [{ src, url: sourceUrl }] = sources as SourceObjectWithUrl[];

      if (src.startsWith("blob:") && (sourceUrl !== url || closing)) {
        cleanUpBufferUrl(src);
      }
    }
  }, [closing, player, url]);
  const getSource = useCallback(async () => {
    cleanUpSource();

    const isYT = isYouTubeUrl(url);
    const src = isYT ? url : bufferToUrl(await readFile(url));
    const type = isYT ? YT_TYPE : getVideoType(url) || "video/mp4";

    return { src, type, url };
  }, [cleanUpSource, readFile, url]);
  const loadVideo = useCallback(async () => {
    if (!player) {
      const [videoElement] = containerRef.current
        ?.childNodes as NodeListOf<HTMLVideoElement>;
      const videoPlayer = window.videojs(
        videoElement,
        {
          ...config,
          ...(url && { sources: [await getSource()] }),
        },
        () => {
          videoPlayer.on("firstplay", () => {
            const [height, width] = [
              videoPlayer.videoHeight(),
              videoPlayer.videoWidth(),
            ];
            const [vh, vw] = [viewHeight(), viewWidth()];

            if (height && width) {
              if (height > vh || width > vw) {
                updateWindowSize(vw * (height / width), vw);
              } else {
                updateWindowSize(height, width);
              }
            }
          });

          setPlayer(videoPlayer);
        }
      );
    } else if (url) {
      player.src(await getSource());
    }

    if (url) appendFileToTitle(url);
  }, [
    appendFileToTitle,
    containerRef,
    getSource,
    player,
    updateWindowSize,
    url,
  ]);

  useEffect(() => {
    if (loading) {
      loadFiles(libs).then(() => {
        if (window.videojs !== undefined) setLoading(false);
      });
    }
  }, [loading, setLoading]);

  useEffect(() => {
    if (!loading && !player) loadVideo();

    return () => {
      if (closing && player) {
        cleanUpSource();
        player.dispose();
      }
    };
  }, [cleanUpSource, closing, loadVideo, loading, player]);

  useEffect(() => {
    if (!loading && player && url) loadVideo();
  }, [loadVideo, loading, player, url]);
};

export default useVideoPlayer;
