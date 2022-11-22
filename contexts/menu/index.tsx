import Menu from "components/system/Menu";
import contextFactory from "contexts/contextFactory";
import useMenuContextState from "contexts/menu/useMenuContextState";

const { Provider, useContext } = contextFactory(useMenuContextState, <Menu />);

export { Provider as MenuProvider, useContext as useMenu };
