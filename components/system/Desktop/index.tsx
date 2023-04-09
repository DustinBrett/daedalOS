import StyledDesktop from "components/system/Desktop/StyledDesktop";
import useWallpaper from "components/system/Desktop/Wallpapers/useWallpaper";
import FileManager from "components/system/Files/FileManager";
import useHeightOverride from "hooks/useHeightOverride";
import { useRef } from "react";
import { DESKTOP_PATH } from "utils/constants";

const Desktop: FC = ({ children }) => {
  const heightOverride = useHeightOverride();
  const desktopRef = useRef<HTMLElement | null>(null);

  useWallpaper(desktopRef, heightOverride);

  return (
    <StyledDesktop ref={desktopRef} $height={heightOverride}>
      <FileManager
        url={DESKTOP_PATH}
        view="icon"
        allowMovingDraggableEntries
        hideLoading
        hideScrolling
        isDesktop
        loadIconsImmediately
        preloadShortcuts
      />
      {children}
    </StyledDesktop>
  );
};

export default Desktop;
