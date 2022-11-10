import { createContext, useContext } from "react";

const contextFactory = <T,>(
  useContextState: () => T,
  ContextComponent?: React.ComponentType
): {
  Consumer: React.Consumer<T>;
  Provider: FC;
  useContext: () => T;
} => {
  const Context = createContext<T>(Object.create(null) as T);
  const ProcessProvider: FC = ({ children }) => (
    <Context.Provider value={useContextState()}>
      {children}
      {ContextComponent ? <ContextComponent /> : <></>}
    </Context.Provider>
  );

  return {
    Consumer: Context.Consumer,
    Provider: ProcessProvider,
    useContext: () => useContext(Context),
  };
};

export default contextFactory;
