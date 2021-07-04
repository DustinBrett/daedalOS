import Menu from "components/system/Menu";
import contextFactory from "contexts/contextFactory";
import type { MenuContextState } from "contexts/menu/useMenuContextState";
import useMenuContextState from "contexts/menu/useMenuContextState";

const { Consumer, Provider, useContext } = contextFactory<MenuContextState>(
  useMenuContextState,
  () => <Menu />
);

export {
  Consumer as MenuConsumer,
  Provider as MenuProvider,
  useContext as useMenu,
};
