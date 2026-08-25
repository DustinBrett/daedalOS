import { memo, useCallback } from "react";
import StartButtonIcon from "components/system/Taskbar/StartButton/StartButtonIcon";
import StyledTaskbarButton from "components/system/Taskbar/StyledTaskbarButton";
import {
  importStartMenu,
  START_BUTTON_TITLE,
} from "components/system/Taskbar/functions";
import useTaskbarContextMenu from "components/system/Taskbar/useTaskbarContextMenu";
import { CLICK_FOCUSABLE_ELEMENT } from "utils/constants";
import { label, preloadImage } from "utils/functions";
import { useMenuPreload } from "hooks/useMenuPreload";

type StartButtonProps = {
  startMenuVisible: boolean;
  toggleStartMenu: (showMenu?: boolean) => void;
};

const preloadStartMenu = async (): Promise<void> => {
  const preloadedStartMenu = importStartMenu();
  const { default: startMenuIcons } =
    (await import("public/.index/startMenuIcons.json")) || {};

  startMenuIcons?.forEach((icon) => preloadImage(icon));

  await preloadedStartMenu;
};

const StartButton: FC<StartButtonProps> = ({
  startMenuVisible,
  toggleStartMenu,
}) => {
  const onClick = useCallback(
    async ({ ctrlKey, shiftKey }: React.MouseEvent): Promise<void> => {
      toggleStartMenu();

      if (ctrlKey && shiftKey) {
        const { spawnSheep } = await import("utils/spawnSheep");

        spawnSheep();
      }
    },
    [toggleStartMenu]
  );

  return (
    <StyledTaskbarButton
      $active={startMenuVisible}
      aria-expanded={startMenuVisible}
      aria-haspopup="dialog"
      {...(startMenuVisible && { "aria-controls": "startMenu" })}
      onClick={onClick}
      $highlight
      {...CLICK_FOCUSABLE_ELEMENT}
      {...label(START_BUTTON_TITLE)}
      {...useTaskbarContextMenu(true)}
      {...useMenuPreload(preloadStartMenu)}
    >
      <StartButtonIcon />
    </StyledTaskbarButton>
  );
};

export default memo(StartButton);
