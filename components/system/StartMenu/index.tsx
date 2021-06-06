import FileManager from 'components/system/Files/FileManager';
import StyledStartMenu from 'components/system/StartMenu/StyledStartMenu';
import { useSession } from 'contexts/session';
import { useCallback, useEffect, useRef } from 'react';

const StartMenu = (): JSX.Element => {
  const { toggleStartMenu } = useSession();
  const menuRef = useRef<HTMLElement | null>(null);
  const maybeCloseMenu = useCallback(
    ({ relatedTarget }) => {
      if (!menuRef.current?.contains(relatedTarget)) {
        if (
          ![relatedTarget, relatedTarget?.parentElement].includes(
            menuRef.current?.nextSibling
          )
        ) {
          toggleStartMenu(false);
        } else {
          menuRef.current?.focus();
        }
      }
    },
    [toggleStartMenu]
  );

  useEffect(() => menuRef.current?.focus(), []);

  return (
    <StyledStartMenu onBlur={maybeCloseMenu} tabIndex={-1} ref={menuRef}>
      <FileManager url="/start" view="list" />
    </StyledStartMenu>
  );
};

export default StartMenu;
