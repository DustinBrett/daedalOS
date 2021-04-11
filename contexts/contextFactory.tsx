import { createContext, useContext } from 'react';

type ProcessProviderProps = {
  children: React.ReactNode;
};

type ContextFactory = <T>(
  initialContextState: T,
  useContextState: () => T
) => {
  Consumer: React.Consumer<T>;
  Provider: (props: ProcessProviderProps) => JSX.Element;
  useContext: () => T;
};

const contextFactory: ContextFactory = (
  initialContextState,
  useContextState
) => {
  const Context = createContext(initialContextState);
  const ProcessProvider = ({ children }: ProcessProviderProps): JSX.Element => (
    <Context.Provider value={useContextState()}>{children}</Context.Provider>
  );

  return {
    Consumer: Context.Consumer,
    Provider: ProcessProvider,
    useContext: () => useContext(Context)
  };
};

export default contextFactory;
