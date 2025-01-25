import { basename, join } from "path";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CONTROL_BAR_HEIGHT,
  DEFAULT_QUALITY_SIZE,
  VideoResizeKey,
  YT_TYPE,
  config,
  ytQualitySizeMap,
} from "components/apps/VideoPlayer/config";
import {
  type YouTubeTech,
  type SourceObjectWithUrl,
  type VideoPlayer,
  type YouTubePlayer,
  type ControlBar,
} from "components/apps/VideoPlayer/types";
import { type ContainerHookProps } from "components/system/Apps/AppContainer";
import useTitle from "components/system/Window/useTitle";
import useWindowSize from "components/system/Window/useWindowSize";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { DESKTOP_PATH, VIDEO_FALLBACK_MIME_TYPE } from "utils/constants";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  getExtension,
  getMimeType,
  isSafari,
  isYouTubeUrl,
  loadFiles,
  viewHeight,
  viewWidth,
} from "utils/functions";
import { getCoverArt } from "components/system/Files/FileEntry/functions";

const useVideoPlayer = ({
  containerRef,
  id,
  loading,
  setLoading,
  url,
}: ContainerHookProps): void => {
  const { addFile, createPath, readFile, updateFolder } = useFileSystem();
  const {
    argument,
    linkElement,
    processes: { [id]: { closing = false, componentWindow, libs = [] } = {} },
    url: setUrl,
  } = useProcesses();
  const { updateWindowSize } = useWindowSize(id);
  const [player, setPlayer] = useState<VideoPlayer>();
  const [ytPlayer, setYtPlayer] = useState<YouTubePlayer>();
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
  const isYT = useMemo(() => isYouTubeUrl(url), [url]);
  const getSource = useCallback(async () => {
    cleanUpSource();

    const type = isYT ? YT_TYPE : getMimeType(url) || VIDEO_FALLBACK_MIME_TYPE;
    const buffer = isYT ? undefined : await readFile(url);
    const src = isYT
      ? url
      : bufferToUrl(buffer as Buffer, isSafari() ? type : undefined);

    return { buffer, src, type, url };
  }, [cleanUpSource, isYT, readFile, url]);
  const initializedUrlRef = useRef(false);
  const playerInitialized = useRef(false);
  const loadPlayer = useCallback(() => {
    if (playerInitialized.current) return;

    playerInitialized.current = true;

    const [videoElement] =
      (containerRef.current?.childNodes as NodeListOf<HTMLVideoElement>) ?? [];
    const videoPlayer = window.videojs(videoElement, config, () => {
      videoPlayer.on(isYT ? "play" : "canplay", () => {
        if (initializedUrlRef.current) return;

        initializedUrlRef.current = true;

        const { ytPlayer: youTubePlayer } =
          (videoPlayer as YouTubeTech).tech_ || {};

        if (youTubePlayer) setYtPlayer(youTubePlayer);

        const [height, width] = youTubePlayer
          ? ytQualitySizeMap[youTubePlayer.getPlaybackQuality()] ||
            DEFAULT_QUALITY_SIZE
          : [videoPlayer.videoHeight(), videoPlayer.videoWidth()];
        const [vh, vw] = [viewHeight(), viewWidth()];

        if (height && width) {
          const heightWithControlBar =
            height + (youTubePlayer ? 0 : CONTROL_BAR_HEIGHT);

          if (heightWithControlBar > vh || width > vw) {
            updateWindowSize(
              Math.floor(vw * (heightWithControlBar / width)),
              Math.min(width, vw)
            );
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
      const setupOpenFileOnPlay = (): void => {
        const { playToggle } = (videoPlayer as VideoPlayer & ControlBar)
          .controlBar;
        const playFile = (): void => {
          // eslint-disable-next-line unicorn/consistent-function-scoping
          const unBindEvent = (): void => playToggle.off("click", playFile);

          if (videoPlayer.currentSrc()) {
            unBindEvent();
            return;
          }

          addFile(
            DESKTOP_PATH,
            async (name: string, buffer?: Buffer) => {
              unBindEvent();

              const newPath = await createPath(name, DESKTOP_PATH, buffer);

              setUrl(id, join(DESKTOP_PATH, newPath));
              updateFolder(DESKTOP_PATH, newPath);

              return newPath;
            },
            "audio/*,video/*,.mkv",
            false
          );
        };

        playToggle.on("click", playFile);
      };

      videoPlayer.on("error", setupOpenFileOnPlay);
      if (!url) setupOpenFileOnPlay();

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
      if (!isYT) linkElement(id, "peekElement", videoElement);
      argument(id, "play", () => videoPlayer.play());
      argument(id, "pause", () => videoPlayer.pause());
      argument(id, "paused", (callback?: (paused: boolean) => void) => {
        if (callback) {
          videoPlayer.on("pause", () => callback(true));
          videoPlayer.on("play", () => callback(false));
        }

        return videoPlayer.paused();
      });
    });
  }, [
    addFile,
    argument,
    containerRef,
    createPath,
    id,
    isYT,
    linkElement,
    setLoading,
    setUrl,
    updateFolder,
    updateWindowSize,
    url,
  ]);
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
        const { buffer, ...source } = await getSource();

        initializedUrlRef.current = false;
        player.poster("");
        player.src(source);
        maybeHideControlbar(source.type);
        prependFileToTitle(
          isYT ? ytPlayer?.videoTitle || "YouTube" : basename(url)
        );

        const [videoElement] =
          (containerRef.current?.childNodes as NodeListOf<HTMLVideoElement>) ??
          [];

        linkElement(
          id,
          "peekElement",
          isYT ? (componentWindow as HTMLElement) : videoElement
        );
        argument(id, "peekImage", "");

        if (buffer && getExtension(source.url) === ".mp3") {
          getCoverArt(buffer).then((coverPicture) => {
            if (coverPicture) {
              const coverUrl = bufferToUrl(coverPicture);

              player.poster(coverUrl);
              argument(id, "peekImage", coverUrl);
            }
          });
        }
      } catch {
        // Ignore player errors
      }
    }
  }, [
    argument,
    componentWindow,
    containerRef,
    getSource,
    id,
    isYT,
    linkElement,
    maybeHideControlbar,
    player,
    prependFileToTitle,
    url,
    ytPlayer,
  ]);

  useEffect(() => {
    if (loading && !player) {
      const maybeLoadPlayer = (): boolean => {
        const isLibLoaded = typeof window.videojs === "function";

        if (isLibLoaded) loadPlayer();

        return isLibLoaded;
      };

      if (!maybeLoadPlayer()) loadFiles(libs).then(maybeLoadPlayer);
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
