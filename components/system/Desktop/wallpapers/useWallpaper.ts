import { useFileSystem } from "contexts/fileSystem";
import { useSession } from "contexts/session";
import type { WallpaperFit } from "contexts/session/types";
import { useEffect } from "react";
import { useTheme } from "styled-components";
import { EMPTY_BUFFER } from "utils/constants";
import { bufferToUrl, cleanUpBufferUrl } from "utils/functions";

const cssFit: Record<WallpaperFit, string> = {
  fill: "background-size: cover;",
  fit: `
    background-repeat: no-repeat;
    background-size: contain;
  `,
  stretch: "background-size: 100% auto;",
  tile: "background-size: contain;",
  center: `
    background-attachment: fixed;
    background-position: center;
    background-repeat: no-repeat;
  `,
};

const useWallpaper = (
  desktopRef: React.RefObject<HTMLElement | null>
): void => {
  const { fs } = useFileSystem();
  const { wallpaper } = useTheme();
  const { wallpaperImage, wallpaperFit } = useSession();

  useEffect(() => {
    if (wallpaperImage) {
      fs?.readFile(wallpaperImage, (error, contents = EMPTY_BUFFER) => {
        if (!error) {
          const [, currentWallpaperUrl] =
            desktopRef.current?.style.backgroundImage.match(/"(.*?)"/) || [];

          if (currentWallpaperUrl) cleanUpBufferUrl(currentWallpaperUrl);

          wallpaper?.();
          desktopRef.current?.setAttribute(
            "style",
            `
            background-image: url("${bufferToUrl(contents)}");
            ${cssFit[wallpaperFit]}
            `
          );
        }
      });
    } else {
      desktopRef.current?.setAttribute("style", "");
      wallpaper?.(desktopRef.current);
    }
  }, [desktopRef, fs, wallpaper, wallpaperFit, wallpaperImage]);
};

export default useWallpaper;
