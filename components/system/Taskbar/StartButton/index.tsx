import { useCallback, useRef, useState } from "react";
import StartButtonIcon from "components/system/Taskbar/StartButton/StartButtonIcon";
import StyledTaskbarButton from "components/system/Taskbar/StyledTaskbarButton";
import { START_BUTTON_TITLE } from "components/system/Taskbar/functions";
import useTaskbarContextMenu from "components/system/Taskbar/useTaskbarContextMenu";
import { DIV_BUTTON_PROPS } from "utils/constants";
import { label, preloadImage } from "utils/functions";

type StartButtonProps = {
  startMenuVisible: boolean;
  toggleStartMenu: (showMenu?: boolean) => void;
};

const StartButton: FC<StartButtonProps> = ({
  startMenuVisible,
  toggleStartMenu,
}) => {
  const [preloaded, setPreloaded] = useState(false);
  const initalizedPreload = useRef(false);
  const preloadIcons = useCallback(async (): Promise<void> => {
    if (initalizedPreload.current) return;
    initalizedPreload.current = true;

    const startMenuIcons = (await import("public/.index/startMenuIcons.json"))
      .default;

    startMenuIcons?.forEach((icon) => preloadImage(icon));

    setPreloaded(true);
  }, []);
  const onClick = useCallback(
    async ({ ctrlKey, shiftKey }: React.MouseEvent): Promise<void> => {
      if (!preloaded) preloadIcons();

      toggleStartMenu();

      if (ctrlKey && shiftKey) {
        const { spawnSheep } = await import("utils/spawnSheep");

        spawnSheep();
      }
    },
    [preloadIcons, preloaded, toggleStartMenu]
  );

  return (
    <StyledTaskbarButton
      $active={startMenuVisible}
      onClick={onClick}
      onMouseOver={preloaded ? undefined : preloadIcons}
      $highlight
      {...DIV_BUTTON_PROPS}
      {...label(START_BUTTON_TITLE)}
      {...useTaskbarContextMenu(true)}
    >
      <StartButtonIcon />
    </StyledTaskbarButton>
  );
};

export default StartButton;
