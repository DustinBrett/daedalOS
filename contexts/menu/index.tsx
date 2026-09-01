import Menu from "components/system/Menu";
import contextActionSelectorFactory from "contexts/contextActionSelectorFactory";
import useMenuContextState, {
  type MenuState,
} from "contexts/menu/useMenuContextState";

const { Provider, useContextActions, useStateSelector } =
  contextActionSelectorFactory(useMenuContextState, <Menu />);

export const useMenu = (): MenuState => useStateSelector((state) => state.menu);

export { Provider as MenuProvider, useContextActions as useMenuActions };
