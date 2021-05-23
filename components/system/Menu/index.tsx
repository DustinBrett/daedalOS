import MenuItemEntry from 'components/system/Menu/MenuItemEntry';
import StyledMenu from 'components/system/Menu/StyledMenu';
import { useMenu } from 'contexts/menu/index';
import { useCallback, useEffect, useRef } from 'react';

const Menu = (): JSX.Element => {
  const { menu: { items, x = 0, y = 0 } = {}, setMenu } = useMenu();
  const resetMenu = useCallback(() => setMenu({}), [setMenu]);
  const menuRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (items) menuRef?.current?.focus();
  }, [items]);

  return items ? (
    <StyledMenu onBlur={resetMenu} ref={menuRef} tabIndex={-1} x={x} y={y}>
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
