import MenuItemEntry from "components/system/Menu/MenuItemEntry";
import menuTransition from "components/system/Menu/menuTransition";
import StyledMenu from "components/system/Menu/StyledMenu";
import { useMenu } from "contexts/menu/index";
import type { MenuState } from "contexts/menu/useMenuContextState";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Position } from "react-rnd";
import { FOCUSABLE_ELEMENT, ONE_TIME_PASSIVE_EVENT } from "utils/constants";

type MenuProps = {
  subMenu?: MenuState;
};

const Menu = ({ subMenu }: MenuProps): JSX.Element => {
  const { menu: baseMenu = {}, setMenu } = useMenu();
  const { items, x = 0, y = 0 } = subMenu || baseMenu;
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const menuRef = useRef<HTMLElement | null>(null);
  const resetMenu = useCallback(
    ({ relatedTarget }: Partial<FocusEvent | MouseEvent> = {}) => {
      if (
        !(relatedTarget instanceof HTMLElement) ||
        !menuRef.current?.contains(relatedTarget)
      ) {
        setMenu({});
      }
    },
    [setMenu]
  );

  useEffect(() => {
    if (items && !subMenu) {
      const focusedElement = document.activeElement;

      if (
        focusedElement instanceof HTMLElement &&
        focusedElement !== document.body
      ) {
        const options: AddEventListenerOptions = {
          capture: true,
          ...ONE_TIME_PASSIVE_EVENT,
        };

        const menuUnfocused = ({
          relatedTarget,
          type,
        }: MouseEvent | FocusEvent) => {
          if (
            !(relatedTarget instanceof HTMLElement) ||
            !menuRef.current?.contains(relatedTarget)
          ) {
            resetMenu();
          }

          focusedElement.removeEventListener(
            type === "click" ? "blur" : "click",
            menuUnfocused
          );
        };

        focusedElement.addEventListener("click", menuUnfocused, options);
        focusedElement.addEventListener("blur", menuUnfocused, options);
      } else {
        menuRef.current?.focus();
      }
    }
  }, [items, resetMenu, subMenu]);

  useEffect(() => {
    const { height = 0, width = 0 } =
      menuRef.current?.getBoundingClientRect() || {};
    const { innerHeight, innerWidth } = window;
    const bottomOffset = y + height > innerHeight ? innerHeight - y : 0;

    setOffset({
      x: Math.round(Math.max(0, x + width - innerWidth)),
      y: Math.round(Math.max(0, y + height - (innerHeight - bottomOffset))),
    });
  }, [x, y]);

  return items ? (
    <StyledMenu
      onBlurCapture={resetMenu}
      ref={menuRef}
      isSubMenu={!!subMenu}
      x={x - offset.x}
      y={y - offset.y}
      {...menuTransition}
      {...FOCUSABLE_ELEMENT}
    >
      <ol>
        {items.map((item, index) => (
          <MenuItemEntry
            key={item.label || index}
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
