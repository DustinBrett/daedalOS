import { useCallback, useRef, useState } from "react";
import { TRANSITIONS_IN_MILLISECONDS } from "utils/constants";
import { isSafari } from "utils/functions";

export type MenuItem = {
  SvgIcon?: React.MemoExoticComponent<() => React.JSX.Element>;
  action?: () => void;
  checked?: boolean;
  disabled?: boolean;
  icon?: string;
  label?: string;
  menu?: MenuItem[];
  primary?: boolean;
  seperator?: boolean;
  toggle?: boolean;
  tooltip?: string;
};

export type MenuState = {
  items?: MenuItem[];
  staticX?: number;
  staticY?: number;
  x?: number;
  y?: number;
};

export type CaptureTriggerEvent = React.MouseEvent | React.TouchEvent;

type MenuOptions = {
  staticX?: number;
  staticY?: number;
};

export type ContextMenuCapture = {
  onContextMenuCapture: (
    event?: CaptureTriggerEvent,
    domRect?: DOMRect,
    options?: MenuOptions
  ) => void;
  onTouchEnd?: React.TouchEventHandler;
  onTouchMove?: React.TouchEventHandler;
  onTouchStart?: React.TouchEventHandler;
};

type MenuContextState = {
  contextMenu: (
    getItems: (event?: CaptureTriggerEvent) => MenuItem[]
  ) => ContextMenuCapture;
  menu: MenuState;
  setMenu: React.Dispatch<React.SetStateAction<MenuState>>;
};

const useMenuContextState = (): MenuContextState => {
  const [menu, setMenu] = useState<MenuState>(Object.create(null) as MenuState);
  const touchTimer = useRef<number>(0);
  const touchEvent = useRef<React.TouchEvent>();
  const contextMenu = useCallback(
    (
      getItems: (event?: CaptureTriggerEvent) => MenuItem[]
    ): ContextMenuCapture => {
      const onContextMenuCapture = (
        event?: CaptureTriggerEvent,
        domRect?: DOMRect,
        options?: MenuOptions
      ): void => {
        const { staticX, staticY } = options || {};
        let x = 0;
        let y = 0;

        if (event) {
          if (event.cancelable) event.preventDefault();

          ({ pageX: x, pageY: y } =
            "touches" in event ? event.touches.item?.(0) || event : event);
        } else if (domRect) {
          const { height, x: inputX, y: inputY } = domRect;

          x = inputX;
          y = inputY + height;
        }

        const items = getItems(event);

        setMenu({
          items: items.length > 0 ? items : undefined,
          staticX,
          staticY,
          x,
          y,
        });
      };

      return {
        onContextMenuCapture,
        ...(isSafari() && {
          onTouchEnd: (event) => {
            if (touchEvent.current) {
              event.preventDefault();
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
    },
    []
  );

  return { contextMenu, menu, setMenu };
};

export default useMenuContextState;
