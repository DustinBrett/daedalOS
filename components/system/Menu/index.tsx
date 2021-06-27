import MenuItemEntry from 'components/system/Menu/MenuItemEntry';
import StyledMenu from 'components/system/Menu/StyledMenu';
import { useMenu } from 'contexts/menu/index';
import type { MenuState } from 'contexts/menu/useMenuContextState';
import { useEffect, useRef } from 'react';

type MenuProps = {
  subMenu?: MenuState;
};

const Menu = ({ subMenu }: MenuProps): JSX.Element => {
  const { menu: baseMenu = {}, setMenu } = useMenu();
  const { items, x = 0, y = 0 } = subMenu || baseMenu;
  const menuRef = useRef<HTMLElement | null>(null);
  const resetMenu = ({
    relatedTarget
  }: Partial<FocusEvent | MouseEvent> = {}) => {
    if (!menuRef.current?.contains(relatedTarget as HTMLElement)) {
      setMenu({});
    }
  };

  useEffect(() => {
    if (items && !subMenu) menuRef?.current?.focus();
  }, [items, subMenu]);

  return items ? (
    <StyledMenu
      onBlur={resetMenu}
      ref={menuRef}
      isSubMenu={!!subMenu}
      tabIndex={-1}
      x={x}
      y={y}
    >
      <ol>
        {items.map((item) => (
          <MenuItemEntry
            key={item.label || item.separator}
            resetMenu={resetMenu}
            {...item}
          />
        ))}
      </ol>
    </StyledMenu>
  ) : (
    <></>
  );
};

export default Menu;
