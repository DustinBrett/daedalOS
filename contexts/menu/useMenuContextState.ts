import { useState } from "react";

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

export type MenuContextState = {
  menu: MenuState;
  setMenu: React.Dispatch<React.SetStateAction<MenuState>>;
  contextMenu: (items: MenuItem[]) => React.MouseEventHandler;
};

export type ContextMenuCapture = {
  onContextMenuCapture: React.MouseEventHandler<HTMLElement>;
};

const useMenuContextState = (): MenuContextState => {
  const [menu, setMenu] = useState<MenuState>({});
  const contextMenu =
    (items: MenuItem[]): React.MouseEventHandler =>
    (event) => {
      event.preventDefault();
      const { pageX: x, pageY: y } = event;
      setMenu({ items, x, y });
    };

  return { contextMenu, menu, setMenu };
};

export default useMenuContextState;
