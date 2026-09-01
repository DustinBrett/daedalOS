import { type Position } from "react-rnd";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import MenuItemEntry from "components/system/Menu/MenuItemEntry";
import StyledMenu from "components/system/Menu/StyledMenu";
import menuTransition from "components/system/Menu/menuTransition";
import { useMenuActions, useMenu } from "contexts/menu/index";
import { type MenuState } from "contexts/menu/useMenuContextState";
import {
  FOCUSABLE_ELEMENT,
  ONE_TIME_PASSIVE_EVENT,
  PREVENT_SCROLL,
  TASKBAR_HEIGHT,
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
  const { setMenu } = useMenuActions();
  const baseMenu = useMenu();
  const {
    items,
    staticX = 0,
    staticY = 0,
    x = 0,
    y = 0,
  } = subMenu || baseMenu || {};
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
  const offsetCalculated = useRef<Partial<DOMRect>>({});
  const calculateOffset = useCallback(() => {
    if (!menuRef.current) return;

    const {
      height = 0,
      width = 0,
      x: menuX = 0,
      y: menuY = 0,
    } = menuRef.current?.getBoundingClientRect() || {};
    const [vh, vw] = [viewHeight(), viewWidth()];
    const offsetToCalculate = {
      height,
      vh,
      vw,
      width,
      x,
      y,
    };
    const isOffsetCalculated =
      JSON.stringify(offsetToCalculate) ===
      JSON.stringify(offsetCalculated.current);

    if (isOffsetCalculated) return;

    offsetCalculated.current = offsetToCalculate;

    const newOffset = { x: 0, y: 0 };

    if (!staticX) {
      const subMenuOffscreenX = Boolean(subMenu) && menuX + width > vw;

      newOffset.x =
        Math.round(Math.max(0, x + width - vw)) +
        (subMenuOffscreenX ? Math.round(width + (subMenu?.x || 0)) : 0);

      const adjustedOffsetX =
        subMenuOffscreenX && menuX - newOffset.x < 0
          ? newOffset.x - (newOffset.x - menuX)
          : 0;

      if (adjustedOffsetX > 0) newOffset.x = adjustedOffsetX;
    }

    if (!staticY) {
      const adjustedHeight = vh - TASKBAR_HEIGHT;
      const bottomOffset = y + height > adjustedHeight ? adjustedHeight - y : 0;
      const topAdjustedBottomOffset =
        bottomOffset + height > adjustedHeight ? 0 : bottomOffset;
      const subMenuOffscreenY =
        Boolean(subMenu) && menuY + height > adjustedHeight;

      newOffset.y =
        Math.round(
          Math.max(0, y + height - (adjustedHeight - topAdjustedBottomOffset))
        ) + (subMenuOffscreenY ? Math.round(height + (subMenu?.y || 0)) : 0);

      if (subMenu && menuY - newOffset.y < 0) {
        newOffset.y = Math.round(menuY);
      }
    }

    setOffset(newOffset);
  }, [staticX, staticY, subMenu, x, y]);
  const menuCallbackRef = useCallback(
    (ref: HTMLElement) => {
      menuRef.current = ref;
      calculateOffset();
    },
    [calculateOffset]
  );

  useEffect(() => {
    if ((subMenu || baseMenu)?.items && (x || y)) calculateOffset();
  }, [baseMenu, calculateOffset, subMenu, x, y]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

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
            menuUnfocused,
            { capture: true }
          );
        };

        focusedElement.addEventListener("click", menuUnfocused, options);
        focusedElement.addEventListener("blur", menuUnfocused, options);

        cleanup = () => {
          focusedElement.removeEventListener("click", menuUnfocused, {
            capture: true,
          });
          focusedElement.removeEventListener("blur", menuUnfocused, {
            capture: true,
          });
        };
      } else {
        menuRef.current?.focus(PREVENT_SCROLL);
      }
    }

    return cleanup;
  }, [items, resetMenu, subMenu]);

  useEffect(() => {
    if (!items) offsetCalculated.current = {};
    // eslint-disable-next-line react-hooks-addons/no-unused-deps
  }, [items, offset.x, offset.y, subMenu]);

  useEffect(() => {
    const resetOnEscape = ({ key }: KeyboardEvent): void => {
      if (key === "Escape") resetMenu();
    };

    if (items) {
      window.addEventListener("keydown", resetOnEscape, { passive: true });
    }

    return () => window.removeEventListener("keydown", resetOnEscape);
  }, [items, resetMenu]);

  return items ? (
    <StyledMenu
      ref={menuCallbackRef}
      $isSubMenu={isSubMenu}
      $x={staticX || x - offset.x}
      $y={staticY || y - offset.y}
      aria-label="Context"
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

export default memo(Menu);
