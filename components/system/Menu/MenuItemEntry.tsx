import { useTheme } from "styled-components";
import { type Position } from "react-rnd";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Menu, { topLeftPosition } from "components/system/Menu";
import {
  Checkmark,
  ChevronRight,
  Circle,
} from "components/system/Menu/MenuIcons";
import { type MenuItem } from "contexts/menu/useMenuContextState";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import {
  DIV_BUTTON_PROPS,
  FOCUSABLE_ELEMENT,
  PREVENT_SCROLL,
  TRANSITIONS_IN_MILLISECONDS,
} from "utils/constants";
import { haltEvent } from "utils/functions";

type MenuItemEntryProps = MenuItem & {
  isSubMenu: boolean;
  resetMenu: () => void;
};

const MenuItemEntry: FC<MenuItemEntryProps> = ({
  action,
  checked,
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
  const [subMenuOffset, setSubMenuOffset] = useState<Position>(topLeftPosition);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const { sizes } = useTheme();
  const showSubMenuTimerRef = useRef<number>(0);
  const [mouseOver, setMouseOver] = useState(false);
  const canMouseOver = useMemo(
    () => window.matchMedia("(hover: hover)").matches,
    []
  );
  const setDelayedShowSubMenu = useCallback((show: boolean) => {
    if (showSubMenuTimerRef.current) {
      window.clearTimeout(showSubMenuTimerRef.current);
      showSubMenuTimerRef.current = 0;
    }

    showSubMenuTimerRef.current = window.setTimeout(
      () => setShowSubMenu(show),
      TRANSITIONS_IN_MILLISECONDS.MOUSE_IN_OUT
    );
  }, []);
  const onMouseEnter: React.MouseEventHandler = useCallback(() => {
    setMouseOver(true);
    if (menu) setDelayedShowSubMenu(true);
  }, [menu, setDelayedShowSubMenu]);
  const onMouseLeave: React.MouseEventHandler = useCallback(
    ({ relatedTarget, type }) => {
      if (
        !(relatedTarget instanceof HTMLElement) ||
        !entryRef.current?.contains(relatedTarget)
      ) {
        setMouseOver(false);

        if (type === "mouseleave") {
          setDelayedShowSubMenu(false);
        } else {
          setShowSubMenu(false);
        }
      }
    },
    [setDelayedShowSubMenu]
  );
  const subMenuEvents = useMemo(
    () =>
      menu
        ? {
            onBlur: onMouseLeave as unknown as React.FocusEventHandler,
            onMouseEnter,
            onMouseLeave,
          }
        : {},
    [menu, onMouseEnter, onMouseLeave]
  );
  const triggerAction = useCallback<React.MouseEventHandler>(
    (event) => {
      haltEvent(event);

      if (menu) setShowSubMenu(true);
      else {
        action?.();
        resetMenu();
      }
    },
    [action, menu, resetMenu]
  );

  useEffect(() => {
    const menuEntryElement = entryRef.current;
    const showBaseMenu = !isSubMenu && menu && !showSubMenu;
    const touchListener = (event: TouchEvent): void => {
      if (showBaseMenu) {
        haltEvent(event);
        menuEntryElement?.focus(PREVENT_SCROLL);
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
      title={tooltip}
      {...FOCUSABLE_ELEMENT}
      {...(menu && subMenuEvents)}
    >
      {seperator ? (
        <hr />
      ) : (
        <Button
          aria-label={label}
          className={
            showSubMenu && (!canMouseOver || mouseOver) ? "active" : undefined
          }
          onMouseUp={triggerAction}
          {...DIV_BUTTON_PROPS}
        >
          {icon &&
            (/\p{Emoji_Presentation}/u.test(icon) ? (
              <span>{icon}</span>
            ) : (
              <Icon alt={label} imgSize={16} src={icon} />
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
        <Menu subMenu={{ items: menu, ...subMenuOffset }} />
      )}
    </li>
  );
};

export default memo(MenuItemEntry);
