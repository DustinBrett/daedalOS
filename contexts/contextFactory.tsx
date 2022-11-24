import { createContext, memo, useContext } from "react";

const contextFactory = <T,>(
  useContextState: () => T,
  ContextComponent?: JSX.Element
): {
  Consumer: React.Consumer<T>;
  Provider: React.MemoExoticComponent<FC>;
  useContext: () => T;
} => {
  const Context = createContext(Object.create(null) as T);

  return {
    Consumer: Context.Consumer,
    Provider: memo<FC>(({ children }) => (
      <Context.Provider value={useContextState()}>
        {children}
        {ContextComponent}
      </Context.Provider>
    )),
    useContext: () => useContext(Context),
  };
};

export default contextFactory;
