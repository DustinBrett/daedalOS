import Menu from "components/system/Menu";
import contextFactory from "contexts/contextFactory";
import type { MenuContextState } from "contexts/menu/useMenuContextState";
import useMenuContextState from "contexts/menu/useMenuContextState";

const { Provider, useContext } = contextFactory<MenuContextState>(
  useMenuContextState,
  () => <Menu />
);

export { Provider as MenuProvider, useContext as useMenu };
