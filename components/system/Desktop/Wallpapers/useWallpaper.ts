import hexells from "components/system/Desktop/Wallpapers/hexells";
import vantaWaves from "components/system/Desktop/Wallpapers/vantaWaves";
import { config } from "components/system/Desktop/Wallpapers/vantaWaves/config";
import { useFileSystem } from "contexts/fileSystem";
import { useSession } from "contexts/session";
import type { WallpaperFit } from "contexts/session/types";
import useWorker from "hooks/useWorker";
import { useCallback, useEffect } from "react";
import {
  bufferToUrl,
  cleanUpBufferUrl,
  createOffscreenCanvas,
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

export const WALLPAPERS = new Set(["HEXELLS", "VANTA"]);

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
      desktopRef.current.querySelector("canvas")?.remove();

      if (
        typeof window.OffscreenCanvas !== "undefined" &&
        wallpaperWorker.current
      ) {
        const offscreen = createOffscreenCanvas(desktopRef.current);

        wallpaperWorker.current.postMessage(
          { canvas: offscreen, devicePixelRatio: window.devicePixelRatio },
          [offscreen]
        );

        window.removeEventListener("resize", resizeListener);
        window.addEventListener("resize", resizeListener, { passive: true });
      } else if (wallpaperImage === "VANTA") {
        vantaWaves(config)(desktopRef.current);
      } else if (wallpaperImage === "HEXELLS") {
        hexells(desktopRef.current);
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
    if (await exists(wallpaperImage)) {
      const [, currentWallpaperUrl] =
        desktopRef.current?.style.backgroundImage.match(/"(.*?)"/) || [];

      if (currentWallpaperUrl) cleanUpBufferUrl(currentWallpaperUrl);

      desktopRef.current?.querySelector("canvas")?.remove();

      if (wallpaperImage === "VANTA") {
        vantaWaves(config)();
      }

      desktopRef.current?.setAttribute(
        "style",
        `
        background-image: url("${bufferToUrl(await readFile(wallpaperImage))}");
        ${cssFit[wallpaperFit]}
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
    wallpaperFit,
    wallpaperImage,
  ]);

  useEffect(() => {
    if (sessionLoaded) {
      if (wallpaperImage && !WALLPAPERS.has(wallpaperImage)) {
        loadFileWallpaper().catch(loadWallpaper);
      } else {
        loadWallpaper();
      }
    }
  }, [loadFileWallpaper, loadWallpaper, sessionLoaded, wallpaperImage]);
};

export default useWallpaper;
