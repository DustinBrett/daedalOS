import FileManager from "components/system/Files/FileManager";
import Sidebar from "components/system/StartMenu/Sidebar";
import StyledStartMenu from "components/system/StartMenu/StyledStartMenu";
import { useSession } from "contexts/session";
import { useEffect, useRef } from "react";

const StartMenu = (): JSX.Element => {
  const { toggleStartMenu } = useSession();
  const menuRef = useRef<HTMLElement | null>(null);
  const maybeCloseMenu: React.FocusEventHandler<HTMLElement> = ({
    relatedTarget,
  }) => {
    const clickedElement = relatedTarget as HTMLElement;
    const clickedInsideMenu = menuRef.current?.contains(clickedElement);

    if (!clickedInsideMenu) {
      const clickedTaskbar = clickedElement === menuRef.current?.nextSibling;
      const clickedStartButton =
        clickedElement?.parentElement === menuRef.current?.nextSibling;

      if (!clickedTaskbar && !clickedStartButton) {
        toggleStartMenu(false);
      } else {
        menuRef.current?.focus();
      }
    }
  };

  useEffect(() => menuRef.current?.focus(), []);

  return (
    <StyledStartMenu onBlur={maybeCloseMenu} tabIndex={-1} ref={menuRef}>
      <Sidebar />
      <FileManager url="/start" view="list" />
    </StyledStartMenu>
  );
};

export default StartMenu;
