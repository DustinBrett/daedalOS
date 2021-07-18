import Menu from "components/system/Menu";
import type { MenuContextState } from "contexts/menu/useMenuContextState";
import useMenuContextState from "contexts/menu/useMenuContextState";
import contextFactory from "utils/contextFactory";

const { Consumer, Provider, useContext } = contextFactory<MenuContextState>(
  useMenuContextState,
  () => <Menu />
);

export {
  Consumer as MenuConsumer,
  Provider as MenuProvider,
  useContext as useMenu,
};
