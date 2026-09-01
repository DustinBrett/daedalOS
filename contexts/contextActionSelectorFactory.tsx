import {
  createContext,
  memo,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

type ActionStateSelectorContext<A, S> = {
  Provider: React.MemoExoticComponent<FC>;
  useContextActions: () => A;
  useStateSelector: <T>(selector: (state: S) => T) => T;
};

// Actions live in a context whose value keeps a stable identity; state is
// only reachable through selectors, so consumers re-render when their
// selected value changes rather than on every state update
const contextActionSelectorFactory = <A, S>(
  useContextState: () => { actions: A; state: S },
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
  const Provider = memo<FC>(({ children }) => {
    const { actions, state } = useContextState();

    // Mirrored during render so same-commit mounts read current state
    store.current = state;

    useEffect(() => {
      store.listeners.forEach((listener) => listener());
      // eslint-disable-next-line react-hooks-addons/no-unused-deps
    }, [state]);

    return (
      <ActionsContext value={actions}>
        {children}
        {ContextComponent}
      </ActionsContext>
    );
  });

  return {
    Provider,
    useContextActions: () => useContext(ActionsContext),
    // Selectors must return referentially stable values for unchanged data
    useStateSelector: <T,>(selector: (state: S) => T): T =>
      useSyncExternalStore(
        subscribe,
        () => selector(store.current),
        () => selector(store.current)
      ),
  };
};

export default contextActionSelectorFactory;
