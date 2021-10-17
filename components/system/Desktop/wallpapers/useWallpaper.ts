import { useFileSystem } from "contexts/fileSystem";
import { useSession } from "contexts/session";
import type { WallpaperFit } from "contexts/session/types";
import { useCallback, useEffect } from "react";
import { useTheme } from "styled-components";
import { bufferToUrl, cleanUpBufferUrl } from "utils/functions";

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

const useWallpaper = (
  desktopRef: React.RefObject<HTMLElement | null>
): void => {
  const { readFile } = useFileSystem();
  const { wallpaper } = useTheme();
  const { sessionLoaded, wallpaperImage, wallpaperFit } = useSession();
  const loadThemeWallpaper = useCallback(() => {
    desktopRef.current?.setAttribute("style", "");
    wallpaper?.(desktopRef.current);
  }, [desktopRef, wallpaper]);
  const loadFileWallpaper = useCallback(async () => {
    const [, currentWallpaperUrl] =
      desktopRef.current?.style.backgroundImage.match(/"(.*?)"/) || [];

    if (currentWallpaperUrl) cleanUpBufferUrl(currentWallpaperUrl);

    wallpaper?.();

    desktopRef.current?.setAttribute(
      "style",
      `
        background-image: url("${bufferToUrl(await readFile(wallpaperImage))}");
        ${cssFit[wallpaperFit]}
      `
    );
  }, [desktopRef, readFile, wallpaper, wallpaperFit, wallpaperImage]);

  useEffect(() => {
    if (sessionLoaded) {
      if (wallpaperImage) {
        try {
          loadFileWallpaper();
        } catch {
          loadThemeWallpaper();
        }
      } else {
        loadThemeWallpaper();
      }
    }
  }, [loadFileWallpaper, loadThemeWallpaper, sessionLoaded, wallpaperImage]);
};

export default useWallpaper;
