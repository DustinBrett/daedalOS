import { useState } from 'react';

export type MenuItem = {
  action?: () => void;
  icon?: string;
  label?: string;
  menu?: MenuItem[];
  primary?: boolean;
  separator?: number;
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
