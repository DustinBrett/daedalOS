import {
  BASE_CANVAS_SELECTOR,
  BASE_VIDEO_SELECTOR,
  bgPositionSize,
  WALLPAPER_PATHS,
  WALLPAPER_WORKERS,
} from "components/system/Desktop/Wallpapers/constants";
import type { WallpaperConfig } from "components/system/Desktop/Wallpapers/types";
import { config as vantaConfig } from "components/system/Desktop/Wallpapers/vantaWaves/config";
import { useFileSystem } from "contexts/fileSystem";
import { useSession } from "contexts/session";
import useWorker from "hooks/useWorker";
import { join } from "path";
import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import {
  DEFAULT_LOCALE,
  HIGH_PRIORITY_REQUEST,
  IMAGE_FILE_EXTENSIONS,
  MILLISECONDS_IN_DAY,
  MILLISECONDS_IN_MINUTE,
  PICTURES_FOLDER,
  PROMPT_FILE,
  SLIDESHOW_FILE,
  UNSUPPORTED_BACKGROUND_EXTENSIONS,
  VIDEO_FILE_EXTENSIONS,
} from "utils/constants";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  createOffscreenCanvas,
  getExtension,
  getYouTubeUrlId,
  isYouTubeUrl,
  jsonFetch,
  viewWidth,
} from "utils/functions";

declare global {
  interface Window {
    WallpaperDestroy: () => void;
  }
}

const WALLPAPER_WORKER_NAMES = Object.keys(WALLPAPER_WORKERS);

let slideshowFiles: string[];

const useWallpaper = (
  desktopRef: React.MutableRefObject<HTMLElement | null>,
  heightOverride: number
): void => {
  const { exists, lstat, readFile, readdir, updateFolder, writeFile } =
    useFileSystem();
  const { sessionLoaded, setWallpaper, wallpaperImage, wallpaperFit } =
    useSession();
  const { colors } = useTheme();
  const [wallpaperName] = wallpaperImage.split(" ");
  const vantaWireframe = wallpaperImage === "VANTA WIREFRAME";
  const wallpaperWorker = useWorker<void>(
    WALLPAPER_WORKERS[wallpaperName],
    undefined,
    vantaWireframe ? "Wireframe" : ""
  );
  const wallpaperTimerRef = useRef<number>();
  const loadWallpaper = useCallback(
    async (keepCanvas?: boolean) => {
      if (!desktopRef.current) return;

      let config: WallpaperConfig | undefined;

      if (wallpaperName === "VANTA") {
        config = { ...vantaConfig };
        vantaConfig.material.options.wireframe = vantaWireframe;
      } else if (wallpaperImage === "MATRIX 3D") {
        config = { volumetric: true };
      } else if (wallpaperName === "STABLE_DIFFUSION") {
        const promptsFilePath = `${PICTURES_FOLDER}/${PROMPT_FILE}`;

        if (await exists(promptsFilePath)) {
          config = {
            prompts: JSON.parse(
              (await readFile(promptsFilePath))?.toString() || "[]"
            ) as [string, string][],
          };
        }

        wallpaperTimerRef.current = window.setTimeout(
          () => loadWallpaper(true),
          MILLISECONDS_IN_MINUTE * 5
        );
      }

      document.documentElement.style.setProperty(
        "background",
        document.documentElement.style.background.replace(/"(.*)"/, ``)
      );

      if (!keepCanvas) {
        desktopRef.current.querySelector(BASE_CANVAS_SELECTOR)?.remove();
      }

      window.WallpaperDestroy?.();

      if (window.OffscreenCanvas !== undefined && wallpaperWorker.current) {
        const workerConfig = { config, devicePixelRatio: 1 };

        if (keepCanvas) {
          wallpaperWorker.current.postMessage(workerConfig);
        } else {
          const offscreen = createOffscreenCanvas(desktopRef.current);

          wallpaperWorker.current.postMessage(
            { canvas: offscreen, ...workerConfig },
            [offscreen]
          );
        }
      } else if (WALLPAPER_PATHS[wallpaperName]) {
        WALLPAPER_PATHS[wallpaperName]().then(({ default: wallpaper }) =>
          wallpaper?.(desktopRef.current, config)
        );
      } else {
        setWallpaper("VANTA");
      }
    },
    [
      desktopRef,
      exists,
      readFile,
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
                  !UNSUPPORTED_BACKGROUND_EXTENSIONS.has(
                    getExtension(entryPath)
                  )
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
    const [, currentWallpaperUrl] =
      document.documentElement.style.background.match(/"(.*?)"/) || [];

    if (currentWallpaperUrl?.startsWith("blob:")) {
      cleanUpBufferUrl(currentWallpaperUrl);
    }

    desktopRef.current?.querySelector(BASE_CANVAS_SELECTOR)?.remove();
    desktopRef.current?.querySelector(BASE_VIDEO_SELECTOR)?.remove();

    let wallpaperUrl = "";
    let fallbackBackground = "";
    let newWallpaperFit = wallpaperFit;
    const isSlideshow = wallpaperName === "SLIDESHOW";

    if (isSlideshow) {
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

      slideshowFiles ||= [
        ...new Set(
          JSON.parse(
            (await readFile(slideshowFilePath))?.toString() || "[]"
          ) as string[]
        ),
      ];

      do {
        wallpaperUrl =
          slideshowFiles[Math.floor(Math.random() * slideshowFiles.length)];

        if (wallpaperUrl.startsWith("/")) {
          wallpaperUrl = `${window.location.origin}${wallpaperUrl}`;
        }
      } while (
        currentWallpaperUrl === wallpaperUrl &&
        slideshowFiles.length > 1
      );

      newWallpaperFit = "fill";
    } else if (wallpaperName === "APOD") {
      document.documentElement.style.setProperty(
        "background",
        document.documentElement.style.background.replace(/"(.*)"/, ``)
      );

      const [, currentUrl, currentDate] = wallpaperImage.split(" ");
      const [month, , day, , year] = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
        timeZone: "US/Eastern",
      })
        .formatToParts(Date.now())
        .map(({ value }) => value);

      if (currentDate === `${year}-${month}-${day}`) {
        wallpaperUrl = currentUrl;
      } else {
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
      }
    } else if (await exists(wallpaperImage)) {
      wallpaperUrl = bufferToUrl(await readFile(wallpaperImage));
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

        desktopRef.current?.appendChild(video);
      } else {
        const applyWallpaper = (url: string): void => {
          const repeat = newWallpaperFit === "tile" ? "repeat" : "no-repeat";
          const positionSize = bgPositionSize[newWallpaperFit];

          document.documentElement.style.setProperty(
            "background",
            `url(${CSS.escape(
              url
            )}) ${positionSize} ${repeat} fixed border-box border-box ${
              colors.background
            }`
          );
        };

        if (fallbackBackground) {
          fetch(wallpaperUrl, {
            ...HIGH_PRIORITY_REQUEST,
            mode: "no-cors",
          })
            .then(({ ok }) => {
              if (!ok) throw new Error("Failed to load url");
            })
            .catch(() => applyWallpaper(fallbackBackground));
        } else {
          applyWallpaper(wallpaperUrl);

          if (isSlideshow) {
            wallpaperTimerRef.current = window.setTimeout(
              loadFileWallpaper,
              MILLISECONDS_IN_MINUTE
            );
          }
        }
      }
    } else {
      loadWallpaper();
    }
  }, [
    colors.background,
    desktopRef,
    exists,
    getAllImages,
    loadWallpaper,
    readFile,
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
        canvasElement.style.height = `${
          heightOverride || desktopRect.height
        }px`;
      }
    };

    window.addEventListener("resize", resizeListener, { passive: true });

    return () => window.removeEventListener("resize", resizeListener);
  }, [desktopRef, heightOverride, wallpaperName, wallpaperWorker]);
};

export default useWallpaper;
