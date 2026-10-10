import { useEffect, useRef, useState } from "react";
import { type Position } from "react-rnd";
import MenuItemEntry from "components/system/Menu/MenuItemEntry";
import menuTransition from "components/system/Menu/menuTransition";
import StyledMenu from "components/system/Menu/StyledMenu";
import { useMenu, useMenuActions } from "contexts/menu/index";
import { type MenuState } from "contexts/menu/useMenuContextState";
import {
  FOCUSABLE_ELEMENT,
  ONE_TIME_PASSIVE_EVENT,
  PREVENT_SCROLL,
  SYSTEM_MENU,
  TASKBAR_HEIGHT,
} from "utils/constants";
import { haltEvent, viewHeight, viewWidth } from "utils/functions";
import {
  focusByCharacter,
  focusByKey,
  isComposingKey,
  isEditableElement,
  isKeyboardNavigating,
  isMenuElement,
  isPrintableKey,
} from "utils/keyboard";

type MenuProps = {
  subMenu?: MenuState;
};

export const topLeftPosition = (): Position => ({
  x: 0,
  y: 0,
});

const MENU_ITEM_SELECTOR = ":scope > ol > li > [role^=menuitem]";

export const getMenuItems = (menu?: Element | null): HTMLElement[] => [
  ...(menu?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) || []),
];

let menuInvoker: HTMLElement | undefined;

// A menu opened from the keyboard took focus from what opened it
let keyboardMenu = false;

export const isKeyboardMenu = (): boolean => keyboardMenu;

// Keys a menu without focus lets through, as they type or move on from it
const PASSED_KEYS = new Set([
  "AltGraph",
  "CapsLock",
  "Control",
  "Meta",
  "Shift",
  "Tab",
]);

const Menu: FC<MenuProps> = ({ subMenu }) => {
  const { setMenu } = useMenuActions();
  const baseMenu = useMenu();
  const {
    items,
    label,
    staticX = 0,
    staticY = 0,
    x = 0,
    y = 0,
  } = subMenu || baseMenu || {};
  const [offset, setOffset] = useState<Position>(topLeftPosition);
  const menuRef = useRef<HTMLElement | null>(null);
  const resetMenu = ({
    relatedTarget,
  }: Partial<React.FocusEvent | React.MouseEvent> = {}): void => {
    if (!isMenuElement(relatedTarget)) {
      setMenu(Object.create(null) as MenuState);

      // What opened a keyboard menu skipped its blur while focus was in the
      // menu, so it gets one now that focus went elsewhere
      if (
        !subMenu &&
        relatedTarget instanceof Element &&
        !menuInvoker?.contains(relatedTarget)
      ) {
        menuInvoker?.dispatchEvent(
          new FocusEvent("focusout", { bubbles: true, relatedTarget })
        );
      }
    }
  };
  const isSubMenu = Boolean(subMenu);
  const offsetCalculated = useRef<Partial<DOMRect>>({});
  const calculateOffset = (): void => {
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
  };
  const menuCallbackRef = (ref: HTMLElement): void => {
    menuRef.current = ref;
    calculateOffset();
  };

  useEffect(() => {
    if ((subMenu || baseMenu)?.items && (x || y)) calculateOffset();
    // eslint-disable-next-line react/exhaustive-effect-dependencies
  }, [baseMenu, calculateOffset, subMenu, x, y]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (items && !subMenu && !isMenuElement(document.activeElement)) {
      const focusedElement = document.activeElement;

      menuInvoker = undefined;

      if (
        focusedElement instanceof HTMLElement &&
        focusedElement !== document.body
      ) {
        menuInvoker = focusedElement;

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
      }

      // Like Windows, a keyboard menu takes focus with nothing highlighted until
      // an arrow key, while a mouse menu or one from a text box leaves focus be
      keyboardMenu =
        Boolean(menuInvoker) &&
        isKeyboardNavigating() &&
        !isEditableElement(menuInvoker);

      if (!menuInvoker || keyboardMenu) menuRef.current?.focus(PREVENT_SCROLL);
    }

    return cleanup;
  }, [items, resetMenu, subMenu]);

  useEffect(() => {
    if (!items) offsetCalculated.current = {};
    // eslint-disable-next-line react/exhaustive-effect-dependencies
  }, [items, offset.x, offset.y, subMenu]);

  useEffect(() => {
    // Keys are taken from wherever focus is while it's outside of the menu, as
    // Windows menus capture the keyboard
    const onKeyDown = (event: KeyboardEvent): void => {
      const { key, shiftKey } = event;
      const { activeElement } = document;

      if (isComposingKey(event) || menuRef.current?.contains(activeElement)) {
        return;
      }

      const menuItems = getMenuItems(menuRef.current);

      if (key === "Escape" || key === "Alt" || (key === "F10" && !shiftKey)) {
        haltEvent(event);
        resetMenu();
      } else if (isEditableElement(activeElement) && label !== SYSTEM_MENU) {
        // Typing goes on in a text box with suggestions showing
        if (
          (key === "ArrowDown" || key === "ArrowUp") &&
          focusByKey(key, menuItems)
        ) {
          haltEvent(event);
        }
      } else if (!PASSED_KEYS.has(key)) {
        haltEvent(event);

        if (key === "Enter") resetMenu();
        else if (
          !focusByKey(key, menuItems, { horizontal: false }) &&
          isPrintableKey(event)
        ) {
          focusByCharacter(key, menuItems);
        }
      }
    };

    if (items && !subMenu) {
      window.addEventListener("keydown", onKeyDown, { capture: true });
    }

    return () =>
      window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [items, label, resetMenu, subMenu]);

  const closeMenu = (): void => {
    resetMenu();
    // Like Windows, focus goes back to where a keyboard-closed menu opened from
    if (menuInvoker?.isConnected) menuInvoker.focus(PREVENT_SCROLL);
  };
  const onKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
    const { key, shiftKey, target } = event;
    const menuItems = getMenuItems(menuRef.current);

    if (
      target !== menuRef.current &&
      !menuItems.includes(target as HTMLElement)
    ) {
      return;
    }

    if (key === "Tab") haltEvent(event);
    else if (
      key === "Alt" ||
      (key === "F10" && !shiftKey) ||
      // Enter with nothing highlighted closes it too
      (!isSubMenu && (key === "Escape" || key === "Enter"))
    ) {
      haltEvent(event);
      closeMenu();
    } else if (
      focusByKey(key, menuItems, { horizontal: false }) ||
      (isPrintableKey(event) && focusByCharacter(key, menuItems))
    ) {
      haltEvent(event);
    }
  };

  return items ? (
    <StyledMenu
      ref={menuCallbackRef}
      $isSubMenu={isSubMenu}
      $x={staticX || x - offset.x}
      $y={staticY || y - offset.y}
      aria-label={label || "Context"}
      onBlurCapture={resetMenu}
      onContextMenu={haltEvent}
      onKeyDown={onKeyDown}
      role="menu"
      {...menuTransition}
      {...FOCUSABLE_ELEMENT}
    >
      <ol role="none">
        {items.map((item, index) => (
          <MenuItemEntry
            // eslint-disable-next-line react/no-array-index-key
            key={`${item.label || "item"}-${index}`}
            closeMenu={closeMenu}
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
