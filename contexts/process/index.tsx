import type { ProcessContextState } from "contexts/process/useProcessContextState";
import useProcessContextState from "contexts/process/useProcessContextState";
import contextFactory from "utils/contextFactory";

const { Consumer, Provider, useContext } = contextFactory<ProcessContextState>(
  useProcessContextState
);

export {
  Consumer as ProcessConsumer,
  Provider as ProcessProvider,
  useContext as useProcesses,
};
