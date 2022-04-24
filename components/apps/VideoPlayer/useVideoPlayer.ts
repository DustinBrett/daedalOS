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
import { basename } from "path";
import { useCallback, useEffect, useState } from "react";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  isYouTubeUrl,
  loadFiles,
  viewHeight,
  viewWidth,
} from "utils/functions";

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
  const loadPlayer = useCallback(() => {
    const [videoElement] =
      (containerRef.current?.childNodes as NodeListOf<HTMLVideoElement>) ?? [];
    const videoPlayer = window.videojs(videoElement, config, () => {
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

      videoElement.addEventListener("dblclick", () =>
        videoPlayer.isFullscreen()
          ? videoPlayer.exitFullscreen()
          : videoPlayer.requestFullscreen()
      );
      setPlayer(videoPlayer);
      setLoading(false);
    });
  }, [containerRef, setLoading, updateWindowSize]);
  const loadVideo = useCallback(async () => {
    if (player && url) {
      try {
        player.src(await getSource());
        appendFileToTitle(basename(url));
      } catch {
        // Ignore player errors
      }
    }
  }, [appendFileToTitle, getSource, player, url]);

  useEffect(() => {
    if (loading && !player) {
      loadFiles(libs).then(() => {
        if (window.videojs !== undefined) {
          loadPlayer();
        }
      });
    }

    return () => {
      if (closing) {
        cleanUpSource();
        player?.dispose();
      }
    };
  }, [cleanUpSource, closing, loadPlayer, loading, player]);

  useEffect(() => {
    if (!loading && !closing && player && url) loadVideo();
  }, [closing, loadVideo, loading, player, url]);
};

export default useVideoPlayer;
