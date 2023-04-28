import MenuItemEntry from "components/system/Menu/MenuItemEntry";
import menuTransition from "components/system/Menu/menuTransition";
import StyledMenu from "components/system/Menu/StyledMenu";
import { useMenu } from "contexts/menu/index";
import type { MenuState } from "contexts/menu/useMenuContextState";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Position } from "react-rnd";
import {
  FOCUSABLE_ELEMENT,
  ONE_TIME_PASSIVE_EVENT,
  PREVENT_SCROLL,
} from "utils/constants";
import { haltEvent, viewHeight, viewWidth } from "utils/functions";

type MenuProps = {
  subMenu?: MenuState;
};

export const topLeftPosition = (): Position => ({
  x: 0,
  y: 0,
});

const Menu: FC<MenuProps> = ({ subMenu }) => {
  const { menu: baseMenu = {}, setMenu } = useMenu();
  const { items, x = 0, y = 0 } = subMenu || baseMenu;
  const [offset, setOffset] = useState<Position>(topLeftPosition);
  const menuRef = useRef<HTMLElement | null>(null);
  const resetMenu = useCallback(
    ({ relatedTarget }: Partial<React.FocusEvent | React.MouseEvent> = {}) => {
      if (
        !(relatedTarget instanceof HTMLElement) ||
        !menuRef.current?.contains(relatedTarget)
      ) {
        setMenu(Object.create(null) as MenuState);
      }
    },
    [setMenu]
  );
  const isSubMenu = Boolean(subMenu);

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
        }: FocusEvent | MouseEvent): void => {
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
        menuRef.current?.focus(PREVENT_SCROLL);
      }
    }
  }, [items, resetMenu, subMenu]);

  useEffect(() => {
    if (!menuRef.current) return;

    const {
      height = 0,
      width = 0,
      x: menuX = 0,
      y: menuY = 0,
    } = menuRef.current?.getBoundingClientRect() || {};
    const [vh, vw] = [viewHeight(), viewWidth()];
    const bottomOffset = y + height > vh ? vh - y : 0;
    const topAdjustedBottomOffset =
      bottomOffset + height > vh ? 0 : bottomOffset;
    const subMenuOffscreenX = Boolean(subMenu) && menuX + width > vw;
    const subMenuOffscreenY = Boolean(subMenu) && menuY + height > vh;
    const newOffset = {
      x:
        Math.round(Math.max(0, x + width - vw)) +
        (subMenuOffscreenX ? Math.round(width + (subMenu?.x || 0)) : 0),
      y:
        Math.round(Math.max(0, y + height - (vh - topAdjustedBottomOffset))) +
        (subMenuOffscreenY ? Math.round(height + (subMenu?.y || 0)) : 0),
    };
    const adjustedOffsetX =
      subMenuOffscreenX && menuX - newOffset.x < 0
        ? newOffset.x - (newOffset.x - menuX)
        : 0;

    setOffset(
      adjustedOffsetX > 0 ? { ...newOffset, x: adjustedOffsetX } : newOffset
    );
  }, [items, subMenu, x, y]);

  return items ? (
    <StyledMenu
      ref={menuRef}
      $isSubMenu={isSubMenu}
      $x={x - offset.x}
      $y={y - offset.y}
      onBlurCapture={resetMenu}
      onContextMenu={haltEvent}
      {...menuTransition}
      {...FOCUSABLE_ELEMENT}
    >
      <ol>
        {items.map((item, index) => (
          <MenuItemEntry
            // eslint-disable-next-line react/no-array-index-key
            key={`${item.label || "item"}-${index}`}
            isSubMenu={isSubMenu}
            resetMenu={resetMenu}
            {...item}
          />
        ))}
      </ol>
    </StyledMenu>
  ) : // eslint-disable-next-line unicorn/no-null
  null;
};

export default Menu;
