import { createContext, useContext } from "react";

const contextFactory = <T,>(
  useContextState: () => T,
  ContextComponent?: React.ComponentType
): {
  Consumer: React.Consumer<T>;
  Provider: (props: React.PropsWithChildren<void>) => JSX.Element;
  useContext: () => T;
} => {
  const Context = createContext<T>({} as T);
  const ProcessProvider = ({
    children,
  }: React.PropsWithChildren<void>): JSX.Element => (
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
