import Menu from "components/system/Menu";
import type { MenuContextState } from "contexts/menu/useMenuContextState";
import useMenuContextState from "contexts/menu/useMenuContextState";
import contextFactory from "utils/contextFactory";

const { Provider, useContext } = contextFactory<MenuContextState>(
  useMenuContextState,
  () => <Menu />
);

export { Provider as MenuProvider, useContext as useMenu };
