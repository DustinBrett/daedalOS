import { useRef, useState } from "react";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import { isSafari } from "utils/functions";

export type MenuItem = {
  action?: () => void;
  checked?: boolean;
  disabled?: boolean;
  icon?: string;
  label?: string;
  menu?: MenuItem[];
  primary?: boolean;
  seperator?: boolean;
  toggle?: boolean;
};

export type MenuState = {
  items?: MenuItem[];
  x?: number;
  y?: number;
};

export type ContextMenuCapture = {
  onContextMenuCapture: (event: React.MouseEvent | React.TouchEvent) => void;
  onTouchEnd?: React.TouchEventHandler;
  onTouchMove?: React.TouchEventHandler;
  onTouchStart?: React.TouchEventHandler;
};

export type MenuContextState = {
  menu: MenuState;
  setMenu: React.Dispatch<React.SetStateAction<MenuState>>;
  contextMenu: (getItems: () => MenuItem[]) => ContextMenuCapture;
};

const useMenuContextState = (): MenuContextState => {
  const [menu, setMenu] = useState<MenuState>({});
  const touchTimer = useRef<number>(0);
  const touchEvent = useRef<React.TouchEvent>();
  const contextMenu = (getItems: () => MenuItem[]): ContextMenuCapture => {
    const onContextMenuCapture = (
      event: React.MouseEvent | React.TouchEvent
    ): void => {
      event.preventDefault();
      const { pageX: x, pageY: y } =
        "touches" in event ? event.touches.item(0) : event;
      setMenu({ items: getItems(), x, y });
    };

    return {
      onContextMenuCapture,
      ...(isSafari() && {
        onTouchEnd: () => {
          if (touchEvent.current) {
            onContextMenuCapture(touchEvent.current);
            touchEvent.current = undefined;
          }
          window.clearTimeout(touchTimer.current);
        },
        onTouchMove: () => {
          touchEvent.current = undefined;
          window.clearTimeout(touchTimer.current);
        },
        onTouchStart: (event: React.TouchEvent) => {
          window.clearTimeout(touchTimer.current);
          touchTimer.current = window.setTimeout(() => {
            touchEvent.current = event;
          }, TRANSITIONS_IN_MILLISECONDS.LONG_PRESS);
        },
      }),
    };
  };

  return { contextMenu, menu, setMenu };
};

export default useMenuContextState;
