import { memo, useCallback } from "react";
import StartButtonIcon from "components/system/Taskbar/StartButton/StartButtonIcon";
import StyledTaskbarButton from "components/system/Taskbar/StyledTaskbarButton";
import {
  importStartMenu,
  START_BUTTON_TITLE,
} from "components/system/Taskbar/functions";
import useTaskbarContextMenu from "components/system/Taskbar/useTaskbarContextMenu";
import { DIV_BUTTON_PROPS } from "utils/constants";
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
      onClick={onClick}
      $highlight
      {...DIV_BUTTON_PROPS}
      {...label(START_BUTTON_TITLE)}
      {...useTaskbarContextMenu(true)}
      {...useMenuPreload(preloadStartMenu)}
    >
      <StartButtonIcon />
    </StyledTaskbarButton>
  );
};

export default memo(StartButton);
