import { join } from "path";
import { useTheme } from "styled-components";
import { useCallback, useEffect, useMemo, useRef } from "react";
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
  DEFAULT_LOCALE,
  DEFAULT_WALLPAPER,
  IMAGE_FILE_EXTENSIONS,
  MILLISECONDS_IN_DAY,
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
  getYouTubeUrlId,
  isBeforeBg,
  isYouTubeUrl,
  jsonFetch,
  parseBgPosition,
  preloadImage,
  viewWidth,
} from "utils/functions";

const slideshowFiles: string[] = [];

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
  const vantaWireframe = wallpaperImage === "VANTA WIREFRAME";
  const wallpaperWorker = useWorker<void>(
    sessionLoaded ? WALLPAPER_WORKERS[wallpaperName] : undefined
  );
  const wallpaperTimerRef = useRef(0);
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
      if (!desktopRef.current || window.DEBUG_DISABLE_WALLPAPER) return;

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

      if (wallpaperName === "VANTA") {
        config = {
          material: {
            options: {
              wireframe: vantaWireframe || !isTopWindow,
            },
          },
          waveSpeed: prefersReducedMotion ? REDUCED_MOTION_PERCENT : 1,
        };
      } else if (wallpaperImage.startsWith("MATRIX")) {
        config = {
          animationSpeed: prefersReducedMotion ? REDUCED_MOTION_PERCENT : 1,
          volumetric: wallpaperImage.endsWith("3D"),
          ...(isTopWindow
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
        const workerConfig = { config, devicePixelRatio: 1 };

        if (keepCanvas) {
          wallpaperWorker.current.postMessage(workerConfig);
        } else {
          const offscreen = createOffscreenCanvas(desktopRef.current);

          wallpaperWorker.current.postMessage(
            { canvas: offscreen, ...workerConfig },
            [offscreen]
          );

          if (wallpaperName === "STABLE_DIFFUSION") {
            const loadingStatus = document.createElement("div");

            loadingStatus.id = "loading-status";

            desktopRef.current?.append(loadingStatus);

            window.WallpaperDestroy = () => {
              loadingStatus.remove();
              window.WallpaperDestroy = undefined;
            };

            wallpaperWorker.current.addEventListener(
              "message",
              ({ data }: { data: WallpaperMessage }) => {
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

                loadingStatus.style.display = data.message ? "block" : "none";
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
      readFile,
      resetWallpaper,
      setWallpaper,
      vantaWireframe,
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

      if (slideshowFiles.length === 0) {
        slideshowFiles.push(
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
        wallpaperUrl = slideshowFiles.shift() || "";

        const [nextWallpaper] = slideshowFiles;

        if (nextWallpaper) {
          document.querySelector(`#${PRELOAD_ID}`)?.remove();

          preloadImage(
            nextWallpaper.startsWith("/")
              ? `${window.location.origin}${nextWallpaper}`
              : nextWallpaper,
            PRELOAD_ID,
            "auto"
          );
        }

        if (wallpaperUrl.startsWith("/")) {
          wallpaperUrl = `${window.location.origin}${wallpaperUrl}`;
        }
      } while (
        currentWallpaperUrl === wallpaperUrl &&
        slideshowFiles.length > 1
      );

      newWallpaperFit = "fill";
    } else if (wallpaperName === "APOD") {
      // eslint-disable-next-line unicorn/no-unreadable-array-destructuring
      const [, , currentDate] = wallpaperImage.split(" ");
      const [month, , day, , year] = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
        day: "2-digit",
        month: "2-digit",
        timeZone: "US/Eastern",
        year: "numeric",
      })
        .formatToParts(Date.now())
        .map(({ value }) => value);

      if (currentDate === `${year}-${month}-${day}`) return;

      resetWallpaper();

      const {
        date = "",
        hdurl = "",
        url = "",
      } = await jsonFetch(
        "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY"
      );

      if (hdurl || url) {
        wallpaperUrl = ((viewWidth() > 1024 ? hdurl : url) || url) as string;
        newWallpaperFit = "fit";

        if (isYouTubeUrl(wallpaperUrl)) {
          const ytBaseUrl = `https://i.ytimg.com/vi/${getYouTubeUrlId(
            wallpaperUrl
          )}`;

          wallpaperUrl = `${ytBaseUrl}/maxresdefault.jpg`;
          fallbackBackground = `${ytBaseUrl}/hqdefault.jpg`;
        } else if (hdurl && url && hdurl !== url) {
          fallbackBackground = (wallpaperUrl === url ? hdurl : url) as string;
        }

        const newWallpaperImage = `APOD ${wallpaperUrl} ${date as string}`;

        if (newWallpaperImage !== wallpaperImage) {
          setWallpaper(newWallpaperImage, newWallpaperFit);
          setTimeout(loadWallpaper, MILLISECONDS_IN_DAY);
        }
      }
    } else if (await exists(wallpaperImage)) {
      resetWallpaper();

      let fileData = await readFile(wallpaperImage);
      const imgExt = getExtension(wallpaperImage);

      if (!NATIVE_IMAGE_FORMATS.has(imgExt)) {
        const { decodeImageToBuffer } = await import("utils/imageDecoder");
        const decodedData = await decodeImageToBuffer(imgExt, fileData);

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
          const checkImg = new Image();

          checkImg.addEventListener("load", () => applyWallpaper(wallpaperUrl));
          checkImg.addEventListener("error", () =>
            applyWallpaper(fallbackBackground)
          );
          checkImg.decoding = "async";
          checkImg.src = wallpaperUrl;
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
    loadWallpaper,
    readFile,
    resetWallpaper,
    setWallpaper,
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
