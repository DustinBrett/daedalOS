import hexells from "components/system/Desktop/Wallpapers/hexells";
import coastalLandscape from "components/system/Desktop/Wallpapers/ShaderToy/CoastalLandscape";
import vantaWaves from "components/system/Desktop/Wallpapers/vantaWaves";
import { config } from "components/system/Desktop/Wallpapers/vantaWaves/config";
import { useFileSystem } from "contexts/fileSystem";
import { useSession } from "contexts/session";
import type { WallpaperFit } from "contexts/session/types";
import useWorker from "hooks/useWorker";
import { useCallback, useEffect } from "react";
import { MILLISECONDS_IN_DAY } from "utils/constants";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  createOffscreenCanvas,
  getYouTubeUrlId,
  isYouTubeUrl,
  jsonFetch,
  viewWidth,
} from "utils/functions";

const cssFit: Record<WallpaperFit, string> = {
  center: "background-repeat: no-repeat;",
  fill: "background-size: cover;",
  fit: `
    background-repeat: no-repeat;
    background-size: contain;
  `,
  stretch: "background-size: 100% 100%;",
  tile: "",
};

const WALLPAPER_WORKERS: Record<string, () => Worker> = {
  COASTAL_LANDSCAPE: (): Worker =>
    new Worker(
      new URL(
        "components/system/Desktop/Wallpapers/ShaderToy/CoastalLandscape/wallpaper.worker",
        import.meta.url
      ),
      { name: "Wallpaper (Coastal Landscape)" }
    ),
  HEXELLS: (): Worker =>
    new Worker(
      new URL(
        "components/system/Desktop/Wallpapers/hexells/wallpaper.worker",
        import.meta.url
      ),
      { name: "Wallpaper (Hexells)" }
    ),
  VANTA: (): Worker =>
    new Worker(
      new URL(
        "components/system/Desktop/Wallpapers/vantaWaves/wallpaper.worker",
        import.meta.url
      ),
      { name: "Wallpaper (Vanta Waves)" }
    ),
};

const useWallpaper = (
  desktopRef: React.MutableRefObject<HTMLElement | null>
): void => {
  const { exists, readFile } = useFileSystem();
  const { sessionLoaded, setWallpaper, wallpaperImage, wallpaperFit } =
    useSession();
  const wallpaperWorker = useWorker<void>(WALLPAPER_WORKERS[wallpaperImage]);
  const resizeListener = useCallback(
    () =>
      wallpaperWorker.current?.postMessage(
        desktopRef.current?.getBoundingClientRect()
      ),
    [desktopRef, wallpaperWorker]
  );
  const loadWallpaper = useCallback(() => {
    if (desktopRef.current) {
      desktopRef.current.setAttribute("style", "");
      desktopRef.current.querySelector(":scope > canvas")?.remove();

      if (
        typeof window.OffscreenCanvas !== "undefined" &&
        wallpaperWorker.current
      ) {
        const offscreen = createOffscreenCanvas(desktopRef.current);

        wallpaperWorker.current.postMessage(
          { canvas: offscreen, devicePixelRatio: 1 },
          [offscreen]
        );

        window.removeEventListener("resize", resizeListener);
        window.addEventListener("resize", resizeListener, { passive: true });
      } else if (wallpaperImage === "VANTA") {
        vantaWaves(config)(desktopRef.current);
      } else if (wallpaperImage === "HEXELLS") {
        hexells(desktopRef.current);
      } else if (wallpaperImage === "COASTAL_LANDSCAPE") {
        coastalLandscape(desktopRef.current);
      } else {
        setWallpaper("VANTA");
      }
    }
  }, [
    desktopRef,
    resizeListener,
    setWallpaper,
    wallpaperImage,
    wallpaperWorker,
  ]);
  const loadFileWallpaper = useCallback(async () => {
    const [, currentWallpaperUrl] =
      desktopRef.current?.style.backgroundImage.match(/"(.*?)"/) || [];

    if (currentWallpaperUrl === wallpaperImage) return;
    if (currentWallpaperUrl) cleanUpBufferUrl(currentWallpaperUrl);
    desktopRef.current?.setAttribute("style", "");
    desktopRef.current?.querySelector(":scope > canvas")?.remove();
    if (wallpaperImage === "VANTA") vantaWaves(config)();

    let wallpaperUrl = "";
    let fallbackBackground = "";
    let newWallpaperFit = wallpaperFit;

    if (wallpaperImage.startsWith("APOD")) {
      const [, currentUrl, currentDate] = wallpaperImage.split(" ");
      const [month, , day, , year] = new Intl.DateTimeFormat("en-US", {
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
            wallpaperUrl = `https://i.ytimg.com/vi/${getYouTubeUrlId(
              wallpaperUrl
            )}/maxresdefault.jpg`;
          }

          if (hdurl && url && hdurl !== url) {
            fallbackBackground = url as string;
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
      desktopRef.current?.setAttribute(
        "style",
        `
        background-image: url("${wallpaperUrl}")${
          fallbackBackground ? `, url(${fallbackBackground})` : ""
        };
        ${cssFit[newWallpaperFit]}
      `
      );
    } else {
      loadWallpaper();
    }
  }, [
    desktopRef,
    exists,
    loadWallpaper,
    readFile,
    setWallpaper,
    wallpaperFit,
    wallpaperImage,
  ]);

  useEffect(() => {
    if (sessionLoaded) {
      if (
        wallpaperImage &&
        !Object.keys(WALLPAPER_WORKERS).includes(wallpaperImage)
      ) {
        loadFileWallpaper().catch(loadWallpaper);
      } else {
        loadWallpaper();
      }
    }
  }, [loadFileWallpaper, loadWallpaper, sessionLoaded, wallpaperImage]);
};

export default useWallpaper;
