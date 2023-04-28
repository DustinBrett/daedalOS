import StartButtonIcon from "components/system/Taskbar/StartButton/StartButtonIcon";
import StyledStartButton from "components/system/Taskbar/StartButton/StyledStartButton";
import useTaskbarContextMenu from "components/system/Taskbar/useTaskbarContextMenu";
import { useState } from "react";
import { ICON_PATH, USER_ICON_PATH } from "utils/constants";
import { getDpi, imageSrc, imageSrcs, isSafari, label } from "utils/functions";

type StartButtonProps = {
  startMenuVisible: boolean;
  toggleStartMenu: (showMenu?: boolean) => void;
};

const StartButton: FC<StartButtonProps> = ({
  startMenuVisible,
  toggleStartMenu,
}) => {
  const [preloaded, setPreloaded] = useState(false);
  const preloadIcons = async (): Promise<void> => {
    const supportsImageSrcSet = !isSafari();
    const preloadedLinks = [
      ...document.querySelectorAll("link[rel=preload]"),
    ] as HTMLLinkElement[];
    const { default: startMenuIcons } = await import(
      "public/.index/startMenuIcons.json"
    );

    startMenuIcons?.forEach((icon) => {
      const link = document.createElement(
        "link"
      ) as HTMLElementWithPriority<HTMLLinkElement>;

      link.as = "image";
      link.fetchPriority = "high";
      link.rel = "preload";
      link.type = "image/webp";

      if (icon.startsWith(ICON_PATH) || icon.startsWith(USER_ICON_PATH)) {
        if (supportsImageSrcSet) {
          link.imageSrcset = imageSrcs(icon, 48, ".webp");
        } else {
          const [href] = imageSrc(icon, 48, getDpi(), ".webp").split(" ");

          link.href = href;
        }
      } else {
        link.href = icon;
      }

      if (
        !preloadedLinks.some(
          (preloadedLink) =>
            (link.imageSrcset &&
              preloadedLink?.imageSrcset?.endsWith(link.imageSrcset)) ||
            (link.href && preloadedLink?.href?.endsWith(link.href))
        )
      ) {
        document.head.append(link);
      }
    });

    setPreloaded(true);
  };

  return (
    <StyledStartButton
      $active={startMenuVisible}
      onClick={() => toggleStartMenu()}
      onMouseOver={preloaded ? undefined : preloadIcons}
      {...label("Start")}
      {...useTaskbarContextMenu(true)}
    >
      <StartButtonIcon />
    </StyledStartButton>
  );
};

export default StartButton;
