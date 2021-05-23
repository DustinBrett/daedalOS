import { createContext, useContext } from 'react';

type ProcessProviderProps = {
  children: React.ReactNode;
};

type ContextFactory = <T>(
  initialContextState: T,
  useContextState: () => T,
  ContextComponent?: React.ComponentType
) => {
  Consumer: React.Consumer<T>;
  Provider: (props: ProcessProviderProps) => JSX.Element;
  useContext: () => T;
};

const contextFactory: ContextFactory = (
  initialContextState,
  useContextState,
  ContextComponent
) => {
  const Context = createContext(initialContextState);
  const ProcessProvider = ({ children }: ProcessProviderProps): JSX.Element => (
    <Context.Provider value={useContextState()}>
      {children}
      {ContextComponent ? <ContextComponent /> : <></>}
    </Context.Provider>
  );

  return {
    Consumer: Context.Consumer,
    Provider: ProcessProvider,
    useContext: () => useContext(Context)
  };
};

export default contextFactory;
