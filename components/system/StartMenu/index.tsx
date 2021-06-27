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
    if (!menuRef.current?.contains(relatedTarget as HTMLElement)) {
      if (
        menuRef.current?.nextSibling &&
        ![
          relatedTarget,
          (relatedTarget as HTMLElement)?.parentElement,
        ].includes(menuRef.current?.nextSibling)
      ) {
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
