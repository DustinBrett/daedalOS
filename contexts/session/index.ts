import contextFactory from "contexts/contextFactory";
import useSessionContextState from "contexts/session/useSessionContextState";

const { Provider, useContext } = contextFactory(useSessionContextState);

export { Provider as SessionProvider, useContext as useSession };
