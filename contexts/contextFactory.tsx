import { createContext, memo, useContext } from "react";

const contextFactory = <T,>(
  useContextState: () => T,
  ContextComponent?: React.JSX.Element
): {
  Provider: React.MemoExoticComponent<FC>;
  useContext: () => T;
} => {
  const Context = createContext(Object.create(null) as T);

  return {
    Provider: memo<FC>(({ children }) => (
      <Context value={useContextState()}>
        {children}
        {ContextComponent}
      </Context>
    )),
    useContext: () => useContext(Context),
  };
};

export default contextFactory;
