import StyledDesktop from "components/system/Desktop/StyledDesktop";
import useWallpaper from "components/system/Desktop/Wallpapers/useWallpaper";
import FileManager from "components/system/Files/FileManager";
import React, { useRef } from "react";
import { DESKTOP_PATH } from "utils/constants";

const Desktop = ({
  children,
}: React.PropsWithChildren<Record<never, unknown>>): JSX.Element => {
  const desktopRef = useRef<HTMLElement | null>(null);

  useWallpaper(desktopRef);

  return (
    <StyledDesktop ref={desktopRef}>
      <FileManager url={DESKTOP_PATH} view="icon" hideLoading hideScrolling />
      {children}
    </StyledDesktop>
  );
};

export default Desktop;
