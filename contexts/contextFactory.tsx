import { createContext, useContext } from "react";

type ProcessProviderProps = {
  children: React.ReactNode;
};

const contextFactory = <T,>(
  useContextState: () => T,
  ContextComponent?: React.ComponentType
): {
  Consumer: React.Consumer<T>;
  Provider: (props: ProcessProviderProps) => JSX.Element;
  useContext: () => T;
} => {
  const Context = createContext<T>({} as T);
  const ProcessProvider = ({ children }: ProcessProviderProps): JSX.Element => (
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
