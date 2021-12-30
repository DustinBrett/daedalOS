import StyledDesktop from "components/system/Desktop/StyledDesktop";
import useWallpaper from "components/system/Desktop/Wallpapers/useWallpaper";
import FileManager from "components/system/Files/FileManager";
import { useRef } from "react";
import { DESKTOP_PATH } from "utils/constants";

type DesktopProps = {
  children: React.ReactNode;
};

const Desktop = ({ children }: DesktopProps): JSX.Element => {
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
