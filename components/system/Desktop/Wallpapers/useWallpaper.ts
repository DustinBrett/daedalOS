import { join } from "path";
import { useTheme } from "styled-components";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { listenGalaxyInput } from "components/system/Desktop/Wallpapers/Galaxy/input";
import { wallpaperHandler } from "components/system/Desktop/Wallpapers/handlers";
import {
  BASE_CANVAS_SELECTOR,
  BASE_VIDEO_SELECTOR,
  PRELOAD_ID,
  REDUCED_MOTION_PERCENT,
  STABLE_DIFFUSION_DELAY_IN_MIN,
  WALLPAPER_PATHS,
  WALLPAPER_WORKERS,
  WALLPAPER_WORKER_NAMES,
  bgPositionSize,
} from "components/system/Desktop/Wallpapers/constants";
import {
  type WallpaperMessage,
  type WallpaperConfig,
} from "components/system/Desktop/Wallpapers/types";
import { useFileSystem } from "contexts/fileSystem";
import { useSession } from "contexts/session";
import useWorker from "hooks/useWorker";
import {
  DEFAULT_WALLPAPER,
  IMAGE_FILE_EXTENSIONS,
  MILLISECONDS_IN_MINUTE,
  NATIVE_IMAGE_FORMATS,
  PICTURES_FOLDER,
  PROMPT_FILE,
  SLIDESHOW_FILE,
  SLIDESHOW_TIMEOUT_IN_MILLISECONDS,
  UNSUPPORTED_SLIDESHOW_EXTENSIONS,
  VIDEO_FILE_EXTENSIONS,
} from "utils/constants";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  createOffscreenCanvas,
  getExtension,
  getSearchParam,
  isBeforeBg,
  isGlobalMusicVisualizationRunning,
  parseBgPosition,
  preloadImage,
} from "utils/functions";

let slideshowFiles: Record<string, string[]> = {};

const useWallpaper = (
  desktopRef: React.RefObject<HTMLElement | null>
): void => {
  const { exists, lstat, readFile, readdir, updateFolder, writeFile } =
    useFileSystem();
  const { sessionLoaded, setWallpaper, wallpaperImage, wallpaperFit } =
    useSession();
  const { colors } = useTheme();
  const [wallpaperName] = useMemo(
    () => wallpaperImage.split(" "),
    [wallpaperImage]
  );
  const isAlt = wallpaperImage.endsWith(" ALT");
  const wallpaperWorker = useWorker<void>(
    sessionLoaded ? WALLPAPER_WORKERS[wallpaperName] : undefined
  );
  const wallpaperTimerRef = useRef(0);
  const wallpaperLoadAbortRef = useRef<AbortController>(undefined);
  const failedOffscreenContext = useRef(false);
  const resetWallpaper = useCallback(
    (keepCanvas?: boolean): void => {
      desktopRef.current?.querySelector(BASE_VIDEO_SELECTOR)?.remove();

      if (!keepCanvas) {
        desktopRef.current?.querySelector(BASE_CANVAS_SELECTOR)?.remove();

        window.WallpaperDestroy?.();
      }

      if (wallpaperName !== "SLIDESHOW") {
        document.documentElement.style.removeProperty("--after-background");
        document.documentElement.style.removeProperty("--before-background");
      }
    },
    [desktopRef, wallpaperName]
  );
  const loadWallpaper = useCallback(
    async (keepCanvas?: boolean) => {
      if (
        !desktopRef.current ||
        window.DEBUG_DISABLE_WALLPAPER ||
        getSearchParam("disableWallpaper") === "true"
      ) {
        return;
      }

      let config: WallpaperConfig | undefined;
      const { matches: prefersReducedMotion } = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );
      let isTopWindow = !window.top || window === window.top;

      if (!isTopWindow) {
        try {
          isTopWindow = window.location.origin !== window.top?.location.origin;
        } catch {
          // Can't read origin, assume top window
          isTopWindow = true;
        }
      }

      if (wallpaperName === "GALAXY") {
        config = {
          faceOn: isAlt,
          speed: prefersReducedMotion ? REDUCED_MOTION_PERCENT : 1,
        };
      } else if (wallpaperName === "VANTA") {
        config = {
          material: {
            options: {
              wireframe: isAlt || !isTopWindow,
            },
          },
          waveSpeed: prefersReducedMotion ? REDUCED_MOTION_PERCENT : 1,
        };
      } else if (wallpaperImage.startsWith("MATRIX")) {
        config = {
          animationSpeed: prefersReducedMotion ? REDUCED_MOTION_PERCENT : 1,
          volumetric: wallpaperImage.startsWith("MATRIX 3D"),
          ...(isTopWindow && !isAlt
            ? {}
            : {
                fallSpeed: -0.09,
                forwardSpeed: -0.25,
              }),
        };
      } else if (wallpaperName === "STABLE_DIFFUSION") {
        const promptsFilePath = `${PICTURES_FOLDER}/${PROMPT_FILE}`;

        if (await exists(promptsFilePath)) {
          config = {
            prompts: JSON.parse(
              (await readFile(promptsFilePath))?.toString() || "[]"
            ) as [string, string][],
          };
        }
      }

      document.documentElement.style.setProperty(
        "background",
        document.documentElement.style.background.replace(/".*"/, "")
      );

      resetWallpaper(keepCanvas);

      if (
        !failedOffscreenContext.current &&
        typeof window.OffscreenCanvas === "function" &&
        wallpaperWorker.current
      ) {
        // GALAXY renders at up to 1.5x native resolution so its point stars
        // stay pin-sharp on hiDPI screens; capped to bound the fill cost on
        // phones, and its quality governor adapts if a GPU can't keep up
        const canvasScale =
          wallpaperName === "GALAXY"
            ? Math.min(window.devicePixelRatio || 1, 1.5)
            : 1;
        const workerConfig = { config, devicePixelRatio: canvasScale };

        if (keepCanvas) {
          wallpaperWorker.current.postMessage(workerConfig);
        } else {
          const offscreen = createOffscreenCanvas(
            desktopRef.current,
            canvasScale
          );

          wallpaperWorker.current.postMessage(
            { canvas: offscreen, ...workerConfig },
            [offscreen]
          );

          if (wallpaperName === "STABLE_DIFFUSION") {
            const loadingStatus = document.createElement("div");

            loadingStatus.id = "loading-status";
            loadingStatus.setAttribute("role", "status");

            desktopRef.current?.append(loadingStatus);

            window.WallpaperDestroy = () => {
              loadingStatus.remove();
              window.WallpaperDestroy = undefined;
            };

            wallpaperWorker.current.addEventListener(
              "message",
              ({ data }: { data: WallpaperMessage }) => {
                // Show the live region before its content changes,
                // otherwise the announcement is unreliable
                loadingStatus.style.display = data.message ? "block" : "none";

                if (data.type === "[error]") {
                  setWallpaper(DEFAULT_WALLPAPER);
                } else if (data.type) {
                  loadingStatus.textContent = data.message || "";
                } else if (!data.message) {
                  wallpaperTimerRef.current = window.setTimeout(
                    () => loadWallpaper(true),
                    MILLISECONDS_IN_MINUTE *
                      (window.STABLE_DIFFUSION_DELAY_IN_MIN_OVERRIDE ??
                        STABLE_DIFFUSION_DELAY_IN_MIN)
                  );
                }
              }
            );
          } else {
            wallpaperWorker.current.addEventListener(
              "message",
              ({ data }: { data: WallpaperMessage }) => {
                if (data.type === "[error]") {
                  if (data.message.includes("getContext")) {
                    failedOffscreenContext.current = true;
                    loadWallpaper();
                  } else {
                    setWallpaper("SLIDESHOW");
                  }
                }
              }
            );
          }

          if (wallpaperName === "GALAXY") {
            const stopInput = listenGalaxyInput({
              onTilt: (x, y) =>
                wallpaperWorker.current?.postMessage({
                  type: "tilt",
                  x,
                  y,
                }),
              onVisibility: (visible) =>
                wallpaperWorker.current?.postMessage({
                  type: "visibility",
                  visible,
                }),
            });

            window.WallpaperDestroy = () => {
              stopInput();
              window.WallpaperDestroy = undefined;
            };
          }
        }
      } else if (WALLPAPER_PATHS[wallpaperName]) {
        const fallbackWallpaper = (): void =>
          setWallpaper(
            wallpaperName === DEFAULT_WALLPAPER
              ? "SLIDESHOW"
              : DEFAULT_WALLPAPER
          );

        WALLPAPER_PATHS[wallpaperName]()
          .then(({ default: wallpaper }) =>
            wallpaper?.(desktopRef.current, config, fallbackWallpaper)
          )
          .catch(fallbackWallpaper);
      } else {
        setWallpaper(DEFAULT_WALLPAPER);
      }
    },
    [
      desktopRef,
      exists,
      isAlt,
      readFile,
      resetWallpaper,
      setWallpaper,
      wallpaperImage,
      wallpaperName,
      wallpaperWorker,
    ]
  );
  const getAllImages = useCallback(
    async (baseDirectory: string): Promise<string[]> =>
      (await readdir(baseDirectory)).reduce<Promise<string[]>>(
        async (images, entry) => {
          const entryPath = join(baseDirectory, entry);

          return [
            ...(await images),
            ...((await lstat(entryPath)).isDirectory()
              ? await getAllImages(entryPath)
              : [
                  IMAGE_FILE_EXTENSIONS.has(getExtension(entryPath)) &&
                  !UNSUPPORTED_SLIDESHOW_EXTENSIONS.has(getExtension(entryPath))
                    ? entryPath
                    : "",
                ]),
          ].filter(Boolean);
        },
        Promise.resolve([])
      ),
    [readdir, lstat]
  );
  const loadFileWallpaper = useCallback(async () => {
    let loadController: AbortController | undefined;
    let [, currentWallpaperUrl] =
      /url\((.*)\)/.exec(
        document.documentElement.style.getPropertyValue(
          isBeforeBg() ? "--before-background" : "--after-background"
        )
      ) || [];

    currentWallpaperUrl = currentWallpaperUrl?.replace(/\\/g, "");

    if (currentWallpaperUrl?.startsWith("blob:")) {
      cleanUpBufferUrl(currentWallpaperUrl);
    }

    let wallpaperUrl = "";
    let fallbackBackground = "";
    let newWallpaperFit = wallpaperFit;
    const isSlideshow = wallpaperName === "SLIDESHOW";

    if (isSlideshow) {
      resetWallpaper();

      const slideshowFilePath = `${PICTURES_FOLDER}/${SLIDESHOW_FILE}`;

      if (!(await exists(slideshowFilePath))) {
        await writeFile(
          slideshowFilePath,
          JSON.stringify(
            (await exists(PICTURES_FOLDER))
              ? await getAllImages(PICTURES_FOLDER)
              : "[]"
          )
        );
        updateFolder(PICTURES_FOLDER, SLIDESHOW_FILE);
      }

      slideshowFiles = {
        [wallpaperImage]: slideshowFiles[wallpaperImage] || [],
      };

      if (slideshowFiles[wallpaperImage].length === 0) {
        slideshowFiles[wallpaperImage].push(
          ...[
            ...new Set(
              JSON.parse(
                (await readFile(slideshowFilePath))?.toString() || "[]"
              ) as string[]
            ),
          ].sort(() => Math.random() - 0.5)
        );
      }

      do {
        wallpaperUrl = slideshowFiles[wallpaperImage].shift() || "";

        const [nextWallpaper] = slideshowFiles[wallpaperImage];

        if (nextWallpaper) {
          preloadImage(
            nextWallpaper.startsWith("/")
              ? `${window.location.origin}${nextWallpaper}`
              : nextWallpaper,
            PRELOAD_ID,
            true,
            "auto"
          );
        }

        if (wallpaperUrl.startsWith("/")) {
          wallpaperUrl = `${window.location.origin}${wallpaperUrl}`;
        }
      } while (
        currentWallpaperUrl === wallpaperUrl &&
        slideshowFiles[wallpaperImage].length > 1
      );

      newWallpaperFit = "fill";
    } else if (wallpaperHandler[wallpaperName]) {
      resetWallpaper();

      wallpaperLoadAbortRef.current?.abort();
      loadController = new AbortController();
      wallpaperLoadAbortRef.current = loadController;

      let newWallpaper:
        | Awaited<ReturnType<(typeof wallpaperHandler)[string]>>
        | undefined;

      try {
        newWallpaper = await wallpaperHandler[wallpaperName]({
          isAlt,
          signal: loadController.signal,
        });
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        throw error;
      }

      if (isGlobalMusicVisualizationRunning()) {
        wallpaperLoadAbortRef.current?.abort();
      }
      if (loadController.signal.aborted) return;

      if (newWallpaper) {
        wallpaperUrl = newWallpaper.wallpaperUrl || "";
        fallbackBackground = newWallpaper.fallbackBackground || "";
        newWallpaperFit = newWallpaper.newWallpaperFit || newWallpaperFit;
        wallpaperTimerRef.current = window.setTimeout(
          loadFileWallpaper,
          newWallpaper.updateTimeout
        );
      }
    } else if (await exists(wallpaperImage)) {
      resetWallpaper();

      const imgExt = getExtension(wallpaperImage);
      const isNative = NATIVE_IMAGE_FORMATS.has(imgExt);
      const [initialData, decoder] = await Promise.all([
        readFile(wallpaperImage),
        isNative
          ? Promise.resolve()
          : import("utils/imageDecoder").then((m) => m.decodeImageToBuffer),
      ]);
      let fileData = initialData;

      if (!isNative && decoder) {
        const decodedData = await decoder(imgExt, fileData);

        if (decodedData) fileData = decodedData;
      }

      wallpaperUrl = bufferToUrl(fileData);
    }

    if (wallpaperUrl) {
      if (VIDEO_FILE_EXTENSIONS.has(getExtension(wallpaperImage))) {
        const video = document.createElement("video");

        video.src = wallpaperUrl;

        video.autoplay = true;
        video.controls = false;
        video.disablePictureInPicture = true;
        video.disableRemotePlayback = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;

        video.style.position = "absolute";
        video.style.inset = "0";
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "cover";
        video.style.objectPosition = "center center";
        video.style.zIndex = "-1";

        video.setAttribute("aria-hidden", "true");

        desktopRef.current?.append(video);
      } else {
        const applyWallpaper = (url: string): void => {
          let positionSize = bgPositionSize[newWallpaperFit];

          if (isSlideshow) {
            try {
              const { searchParams } = new URL(url);
              const { x, y } = Object.fromEntries(searchParams.entries());

              positionSize = `${parseBgPosition(x)} ${parseBgPosition(y)} / cover`;
            } catch {
              // Ignore failure to specify background position
            }
          }

          const repeat = newWallpaperFit === "tile" ? "repeat" : "no-repeat";
          const isTopWindow = window === window.top;
          const isAfterNextBackground = isBeforeBg();

          document.documentElement.style.setProperty(
            "--background-transition-timing",
            isSlideshow ? "1.25s" : "0s"
          );
          document.documentElement.style.setProperty(
            `--${isAfterNextBackground ? "after" : "before"}-background`,
            `url(${CSS.escape(
              url
            )}) ${positionSize} ${repeat} fixed border-box border-box ${
              isTopWindow ? colors.background : colors.text
            }`
          );
          document.documentElement.style.setProperty(
            "--after-background-opacity",
            isAfterNextBackground ? "1" : "0"
          );
          document.documentElement.style.setProperty(
            "--before-background-opacity",
            isAfterNextBackground ? "0" : "1"
          );

          if (!isTopWindow) {
            document.documentElement.style.setProperty(
              "--background-blend-mode",
              "difference"
            );
          }
        };

        if (fallbackBackground) {
          preloadImage(
            wallpaperUrl,
            PRELOAD_ID,
            true,
            "high",
            () => applyWallpaper(wallpaperUrl),
            () => applyWallpaper(fallbackBackground)
          );
        } else {
          applyWallpaper(wallpaperUrl);

          if (isSlideshow) {
            wallpaperTimerRef.current = window.setTimeout(
              loadFileWallpaper,
              SLIDESHOW_TIMEOUT_IN_MILLISECONDS
            );
          }
        }
      }
    } else {
      loadWallpaper();
    }
  }, [
    colors,
    desktopRef,
    exists,
    getAllImages,
    isAlt,
    loadWallpaper,
    readFile,
    resetWallpaper,
    updateFolder,
    wallpaperFit,
    wallpaperImage,
    wallpaperName,
    writeFile,
  ]);

  useEffect(() => {
    if (sessionLoaded) {
      if (wallpaperTimerRef.current) {
        window.clearTimeout(wallpaperTimerRef.current);
        wallpaperTimerRef.current = 0;
      }

      wallpaperLoadAbortRef.current?.abort();

      if (wallpaperName && !WALLPAPER_WORKER_NAMES.includes(wallpaperName)) {
        loadFileWallpaper().catch(loadWallpaper);
      } else {
        loadWallpaper();
      }
    }
  }, [loadFileWallpaper, loadWallpaper, sessionLoaded, wallpaperName]);

  useEffect(() => {
    const resizeListener = (): void => {
      if (!desktopRef.current || !WALLPAPER_PATHS[wallpaperName]) return;

      const desktopRect = desktopRef.current.getBoundingClientRect();

      wallpaperWorker.current?.postMessage(desktopRect);

      const canvasElement =
        desktopRef.current.querySelector(BASE_CANVAS_SELECTOR);

      if (canvasElement instanceof HTMLCanvasElement) {
        canvasElement.style.width = `${desktopRect.width}px`;
        canvasElement.style.height = `${desktopRect.height}px`;
      }
    };

    window.addEventListener("resize", resizeListener, { passive: true });

    return () => window.removeEventListener("resize", resizeListener);
  }, [desktopRef, wallpaperName, wallpaperWorker]);
};

export default useWallpaper;
