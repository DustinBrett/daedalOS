import {
  createContext,
  useContext,
  useLayoutEffect,
  useSyncExternalStore,
} from "react";

type ActionStateSelectorContext<A, S> = {
  getCurrentState: () => S;
  Provider: FC;
  useContextActions: () => A;
  useStateSelector: <T>(selector: (state: S) => T) => T;
};

// Actions live in a context whose value keeps a stable identity; state is
// only reachable through selectors, so consumers re-render when their
// selected value changes rather than on every state update
const contextActionSelectorFactory = <A, S>(
  useContextState: (getState: () => S) => { actions: A; state: S },
  ContextComponent?: React.JSX.Element
): ActionStateSelectorContext<A, S> => {
  const ActionsContext = createContext(Object.create(null) as A);
  const store = {
    current: Object.create(null) as S,
    listeners: new Set<() => void>(),
  };
  const subscribe = (listener: () => void): (() => void) => {
    store.listeners.add(listener);

    return () => store.listeners.delete(listener);
  };
  const getCurrentState = (): S => store.current;
  const Provider: FC = ({ children }) => {
    const { actions, state } = useContextState(getCurrentState);

    // Mirrored during render so same-commit mounts read current state
    // eslint-disable-next-line react/immutability
    store.current = state;

    useLayoutEffect(() => {
      store.listeners.forEach((listener) => listener());
      // eslint-disable-next-line react/exhaustive-effect-dependencies
    }, [state]);

    return (
      <ActionsContext value={actions}>
        {children}
        {ContextComponent}
      </ActionsContext>
    );
  };

  const useContextActions = (): A => useContext(ActionsContext);
  // Selectors must return referentially stable values for unchanged data
  const useStateSelector = <T,>(selector: (state: S) => T): T =>
    useSyncExternalStore(
      subscribe,
      () => selector(store.current),
      () => selector(store.current)
    );

  return {
    // Non-subscribing read for event handlers that only need current state
    getCurrentState,
    Provider,
    useContextActions,
    useStateSelector,
  };
};

export default contextActionSelectorFactory;
