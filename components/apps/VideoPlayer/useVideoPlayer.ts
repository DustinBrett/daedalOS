import {
  config,
  CONTROL_BAR_HEIGHT,
  getMimeType,
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
  isSafari,
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
    linkElement,
    processes: { [id]: { closing = false, libs = [] } = {} },
  } = useProcesses();
  const { updateWindowSize } = useWindowSize(id);
  const [player, setPlayer] = useState<VideoPlayer>();
  const { prependFileToTitle } = useTitle(id);
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
    const type = isYT ? YT_TYPE : getMimeType(url);
    const src = isYT
      ? url
      : bufferToUrl(await readFile(url), isSafari() ? type : undefined);

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
          const heightWithControlBar = CONTROL_BAR_HEIGHT + height;

          if (heightWithControlBar > vh || width > vw) {
            updateWindowSize(vw * (heightWithControlBar / width), vw);
          } else {
            updateWindowSize(heightWithControlBar, width);
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
      if (!isYouTubeUrl(url)) linkElement(id, "peekElement", videoElement);
    });
  }, [containerRef, id, linkElement, setLoading, updateWindowSize, url]);
  const loadVideo = useCallback(async () => {
    if (player && url) {
      try {
        player.src(await getSource());
        prependFileToTitle(isYouTubeUrl(url) ? "YouTube" : basename(url));
      } catch {
        // Ignore player errors
      }
    }
  }, [getSource, player, prependFileToTitle, url]);

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
  }, [cleanUpSource, closing, libs, loadPlayer, loading, player]);

  useEffect(() => {
    if (!loading && !closing && player && url) loadVideo();
  }, [closing, loadVideo, loading, player, url]);
};

export default useVideoPlayer;
