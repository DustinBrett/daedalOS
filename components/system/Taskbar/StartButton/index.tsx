import StartButtonIcon from "components/system/Taskbar/StartButton/StartButtonIcon";
import StyledStartButton from "components/system/Taskbar/StartButton/StyledStartButton";
import useTaskbarContextMenu from "components/system/Taskbar/useTaskbarContextMenu";
import { basename, dirname, join } from "path";
import startMenuIcons from "public/.index/startMenuIcons.json";
import { useState } from "react";
import { ICON_PATH, USER_ICON_PATH } from "utils/constants";
import { label } from "utils/functions";

type StartButtonProps = {
  startMenuVisible: boolean;
  toggleStartMenu: (showMenu?: boolean) => void;
};

const StartButton: FC<StartButtonProps> = ({
  startMenuVisible,
  toggleStartMenu,
}) => {
  const [preloaded, setPreloaded] = useState(false);
  const preloadIcons = (): void => {
    startMenuIcons?.forEach((icon) => {
      const link = document.createElement(
        "link"
      ) as HTMLElementWithPriority<HTMLLinkElement>;

      link.as = "image";
      link.fetchpriority = "high";
      link.rel = "preload";
      link.href = icon;

      if (icon.startsWith(ICON_PATH) || icon.startsWith(USER_ICON_PATH)) {
        link.href = join(dirname(icon), `48x48`, basename(icon)).replace(
          /\\/g,
          "/"
        );
      }

      document.head.appendChild(link);
    });
    setPreloaded(true);
  };

  return (
    <StyledStartButton
      $active={startMenuVisible}
      onClick={() => toggleStartMenu()}
      onMouseOver={!preloaded ? preloadIcons : undefined}
      {...label("Start")}
      {...useTaskbarContextMenu(true)}
    >
      <StartButtonIcon />
    </StyledStartButton>
  );
};

export default StartButton;
