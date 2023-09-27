import {
  CONTROL_BAR_HEIGHT,
  VideoResizeKey,
  YT_TYPE,
  config,
} from "components/apps/VideoPlayer/config";
import type {
  SourceObjectWithUrl,
  VideoPlayer,
} from "components/apps/VideoPlayer/types";
import type { ContainerHookProps } from "components/system/Apps/AppContainer";
import { getMimeType } from "components/system/Files/FileEntry/functions";
import useTitle from "components/system/Window/useTitle";
import useWindowSize from "components/system/Window/useWindowSize";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { basename } from "path";
import { useCallback, useEffect, useState } from "react";
import { VIDEO_FALLBACK_MIME_TYPE } from "utils/constants";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  isSafari,
  isYouTubeUrl,
  loadFiles,
  viewHeight,
  viewWidth,
} from "utils/functions";

const useVideoPlayer = ({
  containerRef,
  id,
  loading,
  setLoading,
  url,
}: ContainerHookProps): void => {
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
    const type = isYT ? YT_TYPE : getMimeType(url) || VIDEO_FALLBACK_MIME_TYPE;
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
      const toggleFullscreen = (): void => {
        try {
          if (videoPlayer.isFullscreen()) videoPlayer.exitFullscreen();
          else videoPlayer.requestFullscreen();
        } catch {
          // Ignore fullscreen errors
        }
      };

      videoElement.addEventListener("dblclick", toggleFullscreen);
      videoElement.addEventListener(
        "mousewheel",
        (event) => {
          videoPlayer.volume(
            videoPlayer.volume() +
              ((event as WheelEvent).deltaY > 0 ? -0.1 : 0.1)
          );
        },
        { passive: true }
      );
      containerRef.current
        ?.closest("section")
        ?.addEventListener("keydown", ({ key, altKey, ctrlKey }) => {
          if (altKey) {
            if (VideoResizeKey[key]) {
              updateWindowSize(
                videoPlayer.videoHeight() / VideoResizeKey[key],
                videoPlayer.videoWidth() / VideoResizeKey[key]
              );
            } else if (key === "Enter") {
              toggleFullscreen();
            }
          } else if (!ctrlKey) {
            // eslint-disable-next-line default-case
            switch (key) {
              case " ":
                if (videoPlayer.paused()) videoPlayer.play();
                else videoPlayer.pause();
                break;
              case "ArrowUp":
                videoPlayer.volume(videoPlayer.volume() + 0.1);
                break;
              case "ArrowDown":
                videoPlayer.volume(videoPlayer.volume() - 0.1);
                break;
              case "ArrowLeft":
                videoPlayer.currentTime(videoPlayer.currentTime() - 10);
                break;
              case "ArrowRight":
                videoPlayer.currentTime(videoPlayer.currentTime() + 10);
                break;
            }
          }
        });
      setPlayer(videoPlayer);
      setLoading(false);
      if (!isYouTubeUrl(url)) linkElement(id, "peekElement", videoElement);
    });
  }, [containerRef, id, linkElement, setLoading, updateWindowSize, url]);
  const maybeHideControlbar = useCallback(
    (type?: string): void => {
      const controlBar =
        containerRef.current?.querySelector(".vjs-control-bar");

      if (controlBar instanceof HTMLElement) {
        if (type === YT_TYPE) {
          controlBar.classList.add("no-interaction");
        } else {
          controlBar.classList.remove("no-interaction");
        }
      }
    },
    [containerRef]
  );
  const loadVideo = useCallback(async () => {
    if (player && url) {
      try {
        const source = await getSource();

        player.src(source);
        maybeHideControlbar(source.type);
        prependFileToTitle(isYouTubeUrl(url) ? "YouTube" : basename(url));
      } catch {
        // Ignore player errors
      }
    }
  }, [getSource, maybeHideControlbar, player, prependFileToTitle, url]);

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
