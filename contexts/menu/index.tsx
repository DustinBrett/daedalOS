import Menu from "components/system/Menu";
import contextActionSelectorFactory from "contexts/contextActionSelectorFactory";
import useMenuContextState, {
  type MenuState,
} from "contexts/menu/useMenuContextState";

const { Provider, getCurrentState, useContextActions, useStateSelector } =
  contextActionSelectorFactory(useMenuContextState, <Menu />);

export const useMenu = (): MenuState => useStateSelector((state) => state.menu);

export const useMenuIsOpen = (): boolean =>
  useStateSelector((state) => (state.menu?.items?.length || 0) > 0);

export const menuIsOpen = (): boolean =>
  (getCurrentState().menu?.items?.length || 0) > 0;

export { Provider as MenuProvider, useContextActions as useMenuActions };
