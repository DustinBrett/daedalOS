import Menu from 'components/system/Menu';
import contextFactory from 'contexts/contextFactory';
import { initialMenuContextState } from 'contexts/initialContextStates';
import type { MenuContextState } from 'contexts/menu/useMenuContextState';
import useMenuContextState from 'contexts/menu/useMenuContextState';

const { Consumer, Provider, useContext } = contextFactory<MenuContextState>(
  initialMenuContextState,
  useMenuContextState,
  Menu
);

export {
  Consumer as MenuConsumer,
  Provider as MenuProvider,
  useContext as useMenu
};
