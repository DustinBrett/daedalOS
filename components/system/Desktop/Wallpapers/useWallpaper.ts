import {
  BASE_CANVAS_SELECTOR,
  bgPositionSize,
  WALLPAPER_PATHS,
  WALLPAPER_WORKERS,
} from "components/system/Desktop/Wallpapers/constants";
import type { WallpaperConfig } from "components/system/Desktop/Wallpapers/types";
import { config as vantaConfig } from "components/system/Desktop/Wallpapers/vantaWaves/config";
import { useFileSystem } from "contexts/fileSystem";
import { useSession } from "contexts/session";
import useWorker from "hooks/useWorker";
import { useCallback, useEffect } from "react";
import { useTheme } from "styled-components";
import {
  DEFAULT_LOCALE,
  HIGH_PRIORITY_REQUEST,
  MILLISECONDS_IN_DAY,
} from "utils/constants";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  createOffscreenCanvas,
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

const useWallpaper = (
  desktopRef: React.MutableRefObject<HTMLElement | null>
): void => {
  const { exists, readFile } = useFileSystem();
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
  const resizeListener = useCallback(() => {
    if (!desktopRef.current) return;

    const desktopRect = desktopRef.current.getBoundingClientRect();

    wallpaperWorker.current?.postMessage(desktopRect);

    const canvasElement =
      desktopRef.current.querySelector(BASE_CANVAS_SELECTOR);

    if (canvasElement instanceof HTMLCanvasElement) {
      canvasElement.style.width = `${desktopRect.width}px`;
      canvasElement.style.height = `${desktopRect.height}px`;
    }
  }, [desktopRef, wallpaperWorker]);
  const loadWallpaper = useCallback(() => {
    if (!desktopRef.current) return;

    let config: WallpaperConfig | undefined;

    if (wallpaperName === "VANTA") {
      config = { ...vantaConfig };
      vantaConfig.material.options.wireframe = vantaWireframe;
    } else if (wallpaperImage === "MATRIX 3D") {
      config = { volumetric: true };
    }

    document.documentElement.style.setProperty("background", "");
    desktopRef.current.querySelector(BASE_CANVAS_SELECTOR)?.remove();

    window.WallpaperDestroy?.();

    if (window.OffscreenCanvas !== undefined && wallpaperWorker.current) {
      const offscreen = createOffscreenCanvas(desktopRef.current);

      wallpaperWorker.current.postMessage(
        { canvas: offscreen, config, devicePixelRatio: 1 },
        [offscreen]
      );

      window.removeEventListener("resize", resizeListener);
      window.addEventListener("resize", resizeListener, { passive: true });
    } else if (WALLPAPER_PATHS[wallpaperName]) {
      WALLPAPER_PATHS[wallpaperName]().then(({ default: wallpaper }) =>
        wallpaper?.(desktopRef.current, config)
      );
    } else {
      setWallpaper("VANTA");
    }
  }, [
    desktopRef,
    resizeListener,
    setWallpaper,
    vantaWireframe,
    wallpaperImage,
    wallpaperName,
    wallpaperWorker,
  ]);
  const loadFileWallpaper = useCallback(async () => {
    const [, currentWallpaperUrl] =
      document.documentElement.style.background.match(/"(.*?)"/) || [];

    if (currentWallpaperUrl) cleanUpBufferUrl(currentWallpaperUrl);

    desktopRef.current?.querySelector(BASE_CANVAS_SELECTOR)?.remove();

    let wallpaperUrl = "";
    let fallbackBackground = "";
    let newWallpaperFit = wallpaperFit;

    if (wallpaperName === "APOD") {
      document.documentElement.style.setProperty("background", "");

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
      const applyWallpaper = (url: string): void => {
        const repeat = newWallpaperFit === "tile" ? "repeat" : "no-repeat";
        const positionSize = bgPositionSize[newWallpaperFit];

        document.documentElement.style.setProperty(
          "background",
          `url(${url}) ${positionSize} ${repeat} fixed border-box border-box ${colors.background}`
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
      }
    } else {
      loadWallpaper();
    }
  }, [
    colors.background,
    desktopRef,
    exists,
    loadWallpaper,
    readFile,
    setWallpaper,
    wallpaperFit,
    wallpaperImage,
    wallpaperName,
  ]);

  useEffect(() => {
    if (sessionLoaded) {
      if (wallpaperName && !WALLPAPER_WORKER_NAMES.includes(wallpaperName)) {
        loadFileWallpaper().catch(loadWallpaper);
      } else {
        loadWallpaper();
      }
    }
  }, [loadFileWallpaper, loadWallpaper, sessionLoaded, wallpaperName]);
};

export default useWallpaper;
