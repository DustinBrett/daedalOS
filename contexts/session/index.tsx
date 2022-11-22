import contextFactory from "contexts/contextFactory";
import useSessionContextState from "contexts/session/useSessionContextState";

const { Consumer, Provider, useContext } = contextFactory(
  useSessionContextState
);

export {
  Consumer as SessionConsumer,
  Provider as SessionProvider,
  useContext as useSession,
};
