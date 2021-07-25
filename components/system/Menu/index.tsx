import MenuItemEntry from "components/system/Menu/MenuItemEntry";
import StyledMenu from "components/system/Menu/StyledMenu";
import { useMenu } from "contexts/menu/index";
import type { MenuState } from "contexts/menu/useMenuContextState";
import { useEffect, useRef, useState } from "react";
import type { Position } from "react-rnd";
import { useTheme } from "styled-components";
import { pxToNum } from "utils/functions";

type MenuProps = {
  subMenu?: MenuState;
};

const Menu = ({ subMenu }: MenuProps): JSX.Element => {
  const { menu: baseMenu = {}, setMenu } = useMenu();
  const { items, x = 0, y = 0 } = subMenu || baseMenu;
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const {
    sizes: { taskbar },
  } = useTheme();
  const menuRef = useRef<HTMLElement | null>(null);
  const resetMenu = ({
    relatedTarget,
  }: Partial<FocusEvent | MouseEvent> = {}) => {
    if (
      relatedTarget instanceof HTMLElement &&
      !menuRef.current?.contains(relatedTarget)
    ) {
      setMenu({});
    }
  };

  useEffect(() => {
    if (items && !subMenu) menuRef?.current?.focus();
  }, [items, subMenu]);

  useEffect(() => {
    const { height = 0, width = 0 } =
      menuRef.current?.getBoundingClientRect() || {};
    const { innerHeight, innerWidth } = window;

    setOffset({
      x: Math.round(Math.max(0, x + width - innerWidth)),
      y: Math.round(
        Math.max(0, y + height - (innerHeight - pxToNum(taskbar.height)))
      ),
    });
  }, [taskbar.height, x, y]);

  return items ? (
    <StyledMenu
      onBlurCapture={resetMenu}
      ref={menuRef}
      isSubMenu={!!subMenu}
      tabIndex={-1}
      x={x - offset.x}
      y={y - offset.y}
    >
      <ol>
        {items.map((item) => (
          <MenuItemEntry
            key={item.label || item.group}
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
