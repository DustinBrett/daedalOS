import contextFactory from "contexts/contextFactory";
import type { SessionContextState } from "contexts/session/types";
import useSessionContextState from "contexts/session/useSessionContextState";

const { Consumer, Provider, useContext } = contextFactory<SessionContextState>(
  useSessionContextState
);

export {
  Consumer as SessionConsumer,
  Provider as SessionProvider,
  useContext as useSession,
};
