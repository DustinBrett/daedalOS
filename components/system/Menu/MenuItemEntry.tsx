import Menu, { topLeftPosition } from "components/system/Menu";
import type { MenuItem } from "contexts/menu/useMenuContextState";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { Position } from "react-rnd";
import { useTheme } from "styled-components";
import Button from "styles/common/Button";
import Icon from "styles/common/Icon";
import { FOCUSABLE_ELEMENT, PREVENT_SCROLL } from "utils/constants";
import { haltEvent } from "utils/functions";

type MenuItemEntryProps = MenuItem & {
  isSubMenu: boolean;
  resetMenu: () => void;
};

const Checkmark = dynamic(() =>
  import("components/system/Menu/MenuIcons").then((mod) => mod.Checkmark)
);

const ChevronRight = dynamic(() =>
  import("components/system/Menu/MenuIcons").then((mod) => mod.ChevronRight)
);

const Circle = dynamic(() =>
  import("components/system/Menu/MenuIcons").then((mod) => mod.Circle)
);

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
  toggle,
}) => {
  const entryRef = useRef<HTMLLIElement | null>(null);
  const [subMenuOffset, setSubMenuOffset] = useState<Position>(topLeftPosition);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const { sizes } = useTheme();
  const onMouseEnter: React.MouseEventHandler = () => setShowSubMenu(true);
  const onMouseLeave: React.MouseEventHandler = ({ relatedTarget }) => {
    if (
      !(relatedTarget instanceof HTMLElement) ||
      !entryRef.current?.contains(relatedTarget)
    ) {
      setShowSubMenu(false);
    }
  };
  const subMenuEvents = menu
    ? {
        onBlur: onMouseLeave as unknown as React.FocusEventHandler,
        onMouseEnter,
        onMouseLeave,
      }
    : {};
  const triggerAction = useCallback<React.MouseEventHandler>(
    (event) => {
      haltEvent(event);

      if (!menu) {
        action?.();
        resetMenu();
      }
    },
    [action, menu, resetMenu]
  );

  useEffect(() => {
    const menuEntryElement = entryRef.current;
    const touchListener = (event: TouchEvent): void => {
      if (!isSubMenu && menu && !showSubMenu) {
        haltEvent(event);
        menuEntryElement?.focus(PREVENT_SCROLL);
      }
      setShowSubMenu(true);
    };

    menuEntryElement?.addEventListener("touchstart", touchListener);

    return () =>
      menuEntryElement?.removeEventListener("touchstart", touchListener);
  }, [isSubMenu, menu, showSubMenu]);

  useLayoutEffect(() => {
    if (menu && entryRef.current) {
      const { height, width } = entryRef.current.getBoundingClientRect();

      setSubMenuOffset({
        x: width - sizes.contextMenu.subMenuOffset,
        y: -height - sizes.contextMenu.subMenuOffset,
      });
    }
  }, [menu, sizes.contextMenu.subMenuOffset]);

  return (
    <li
      ref={entryRef}
      className={disabled ? "disabled" : undefined}
      {...FOCUSABLE_ELEMENT}
      {...(menu && subMenuEvents)}
    >
      {seperator ? (
        <hr />
      ) : (
        <Button
          as="figure"
          className={showSubMenu ? "active" : undefined}
          onClick={triggerAction}
          onMouseUp={triggerAction}
        >
          {icon && <Icon alt={label} imgSize={16} src={icon} />}
          {checked && <Checkmark className="left" />}
          {toggle && <Circle className="left" />}
          <figcaption className={primary ? "primary" : undefined}>
            {label}
          </figcaption>
          {menu && <ChevronRight className="right" />}
        </Button>
      )}
      {showSubMenu && <Menu subMenu={{ items: menu, ...subMenuOffset }} />}
    </li>
  );
};

export default MenuItemEntry;
