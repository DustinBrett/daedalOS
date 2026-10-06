import { createContext, useContext } from "react";

const contextFactory = <T,>(
  useContextState: () => T,
  ContextComponent?: React.JSX.Element
): {
  Provider: FC;
  useContext: () => T;
} => {
  const Context = createContext(Object.create(null) as T);
  const Provider: FC = ({ children }) => (
    <Context value={useContextState()}>
      {children}
      {ContextComponent}
    </Context>
  );
  const useContextValue = (): T => useContext(Context);

  return { Provider, useContext: useContextValue };
};

export default contextFactory;
