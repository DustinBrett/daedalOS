import FileManager from "components/system/Files/FileManager";
import Sidebar from "components/system/StartMenu/Sidebar";
import StyledStartMenu from "components/system/StartMenu/StyledStartMenu";
import useStartMenuTransition from "components/system/StartMenu/useStartMenuTransition";
import { useSession } from "contexts/session";
import { useEffect, useRef } from "react";

const StartMenu = (): JSX.Element => {
  const { toggleStartMenu } = useSession();
  const menuRef = useRef<HTMLElement | null>(null);
  const maybeCloseMenu: React.FocusEventHandler<HTMLElement> = ({
    relatedTarget,
  }) => {
    if (relatedTarget instanceof HTMLElement) {
      const focusedInsideMenu = menuRef.current?.contains(relatedTarget);

      if (!focusedInsideMenu) {
        const focusedTaskbar = relatedTarget === menuRef.current?.nextSibling;
        const focusedStartButton =
          relatedTarget?.parentElement === menuRef.current?.nextSibling;

        if (!focusedTaskbar && !focusedStartButton) {
          toggleStartMenu(false);
        } else {
          menuRef.current?.focus();
        }
      }
    }
  };

  useEffect(() => menuRef.current?.focus(), []);

  return (
    <StyledStartMenu
      onBlurCapture={maybeCloseMenu}
      tabIndex={-1}
      ref={menuRef}
      {...useStartMenuTransition()}
    >
      <Sidebar />
      <FileManager url="/start" view="list" />
    </StyledStartMenu>
  );
};

export default StartMenu;
