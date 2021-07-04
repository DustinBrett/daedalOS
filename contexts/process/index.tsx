import contextFactory from "contexts/contextFactory";
import type { ProcessContextState } from "contexts/process/useProcessContextState";
import useProcessContextState from "contexts/process/useProcessContextState";

const { Consumer, Provider, useContext } = contextFactory<ProcessContextState>(
  useProcessContextState
);

export {
  Consumer as ProcessConsumer,
  Provider as ProcessProvider,
  useContext as useProcesses,
};
