import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { type Position } from "react-rnd";
import { useTheme } from "styled-components";
import Menu, {
  getMenuItems,
  isKeyboardMenu,
  topLeftPosition,
} from "components/system/Menu";
import {
  Checkmark,
  ChevronRight,
  Circle,
} from "components/system/Menu/MenuIcons";
import { type MenuItem } from "contexts/menu/useMenuContextState";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import {
  FOCUSABLE_ELEMENT,
  PREVENT_SCROLL,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";
import { haltEvent } from "utils/functions";
import { isKeyboardInMenu } from "utils/keyboard";

const focusSubMenu = (entry: HTMLElement | null): void =>
  getMenuItems(entry?.querySelector(":scope > nav"))[0]?.focus(PREVENT_SCROLL);

type MenuItemEntryProps = MenuItem & {
  closeMenu: () => void;
  isSubMenu: boolean;
  resetMenu: () => void;
};

const MenuItemEntry: FC<MenuItemEntryProps> = ({
  action,
  checked,
  closeMenu,
  disabled,
  icon,
  isSubMenu,
  label,
  menu,
  primary,
  resetMenu,
  seperator,
  SvgIcon,
  toggle,
  tooltip,
}) => {
  const entryRef = useRef<HTMLLIElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [subMenuOffset, setSubMenuOffset] = useState<Position>(topLeftPosition);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [keyboardSubMenu, setKeyboardSubMenu] = useState(false);
  const { sizes } = useTheme();
  const showSubMenuTimerRef = useRef<number>(0);
  const [mouseOver, setMouseOver] = useState(false);
  // eslint-disable-next-line react/hook-use-state
  const [canMouseOver] = useState(
    () => window.matchMedia("(hover: hover)").matches
  );
  const setDelayedShowSubMenu = (show: boolean): void => {
    if (showSubMenuTimerRef.current) {
      window.clearTimeout(showSubMenuTimerRef.current);
      showSubMenuTimerRef.current = 0;
    }

    showSubMenuTimerRef.current = window.setTimeout(
      () => setShowSubMenu(show),
      TRANSITIONS_IN_MILLISECONDS.MOUSE_IN_OUT
    );
  };
  const onMouseEnter: React.MouseEventHandler = () => {
    setMouseOver(true);
    if (menu) setDelayedShowSubMenu(true);
  };
  // Like Windows, a pointer only selects by moving, not by resting where the
  // menu opened
  const focusOnMouseMove = (): void => {
    if (isKeyboardInMenu(document.activeElement)) {
      buttonRef.current?.focus(PREVENT_SCROLL);
    }
  };
  const onMouseLeave: React.MouseEventHandler = ({ relatedTarget, type }) => {
    if (
      !(relatedTarget instanceof HTMLElement) ||
      !entryRef.current?.contains(relatedTarget)
    ) {
      setMouseOver(false);
      setKeyboardSubMenu(false);

      if (type === "mouseleave") {
        setDelayedShowSubMenu(false);
      } else {
        setShowSubMenu(false);
      }
    }
  };
  const onSubMenuKeyDown: React.KeyboardEventHandler = (event) => {
    if (
      event.target !== buttonRef.current &&
      (event.key === "ArrowLeft" || event.key === "Escape")
    ) {
      haltEvent(event);
      setShowSubMenu(false);
      setKeyboardSubMenu(false);
      buttonRef.current?.focus(PREVENT_SCROLL);
    }
  };
  const subMenuEvents = menu
    ? {
        onBlur: onMouseLeave as unknown as React.FocusEventHandler,
        onKeyDown: onSubMenuKeyDown,
        onMouseEnter,
        onMouseLeave,
      }
    : {};
  const triggerAction: React.MouseEventHandler = (event) => {
    haltEvent(event);

    if (menu) setShowSubMenu(true);
    else if (isKeyboardMenu()) {
      // Like the keyboard, so focus goes back to where the menu opened from
      closeMenu();
      action?.();
    } else {
      action?.();
      resetMenu();
    }
  };
  const onKeyDown: React.KeyboardEventHandler = (event) => {
    const { key } = event;

    if (key === "Enter" || key === " " || (menu && key === "ArrowRight")) {
      haltEvent(event);

      if (disabled) return;

      if (menu) {
        setKeyboardSubMenu(true);
        setShowSubMenu(true);
        focusSubMenu(entryRef.current);
      } else {
        // Closing first lets the action move focus, e.g. to the next window
        closeMenu();
        action?.();
      }
    }
  };
  useEffect(() => {
    if (keyboardSubMenu && showSubMenu) focusSubMenu(entryRef.current);
  }, [keyboardSubMenu, showSubMenu]);

  useEffect(() => {
    const menuEntryElement = entryRef.current;
    const showBaseMenu = !isSubMenu && menu && !showSubMenu;
    const touchListener = (event: TouchEvent): void => {
      if (showBaseMenu) {
        haltEvent(event);
        buttonRef.current?.focus(PREVENT_SCROLL);
      }
      if (menu) setShowSubMenu(true);
    };

    menuEntryElement?.addEventListener("touchstart", touchListener, {
      passive: !showBaseMenu,
    });

    return () =>
      menuEntryElement?.removeEventListener("touchstart", touchListener);
  }, [isSubMenu, menu, showSubMenu]);

  useLayoutEffect(() => {
    if (menu && entryRef.current) {
      const { height, width } = entryRef.current.getBoundingClientRect();

      setSubMenuOffset({
        x: width - sizes.contextMenu.subMenuOffset,
        y: 0 - height - sizes.contextMenu.subMenuOffset,
      });
    }
  }, [menu, sizes.contextMenu.subMenuOffset]);

  return (
    <li
      ref={entryRef}
      className={disabled ? "disabled" : undefined}
      role="none"
      {...(menu && subMenuEvents)}
    >
      {seperator ? (
        <hr />
      ) : (
        <Button
          ref={buttonRef}
          aria-checked={
            checked === undefined && toggle === undefined
              ? undefined
              : Boolean(checked || toggle)
          }
          aria-disabled={disabled || undefined}
          aria-label={label}
          as="div"
          className={
            showSubMenu && (!canMouseOver || mouseOver || keyboardSubMenu)
              ? "active"
              : undefined
          }
          onKeyDown={onKeyDown}
          onMouseMove={focusOnMouseMove}
          onMouseUp={triggerAction}
          role={
            toggle === undefined
              ? checked === undefined
                ? "menuitem"
                : "menuitemcheckbox"
              : "menuitemradio"
          }
          title={tooltip}
          {...(menu && {
            "aria-expanded": showSubMenu,
            "aria-haspopup": "menu",
          })}
          {...FOCUSABLE_ELEMENT}
        >
          {icon &&
            (/\p{Emoji_Presentation}/u.test(icon) ? (
              <span>{icon}</span>
            ) : (
              <Icon alt="" imgSize={16} src={icon} />
            ))}
          {checked && <Checkmark className="left" />}
          {toggle && <Circle className="left" />}
          {SvgIcon && (
            <div className="icon">
              <SvgIcon />
            </div>
          )}
          <figcaption className={primary ? "primary" : undefined}>
            {label}
          </figcaption>
          {menu && <ChevronRight className="right" />}
        </Button>
      )}
      {showSubMenu && menu && (
        <Menu subMenu={{ items: menu, label, ...subMenuOffset }} />
      )}
    </li>
  );
};

export default MenuItemEntry;
