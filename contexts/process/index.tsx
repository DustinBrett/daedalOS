import contextFactory from "contexts/contextFactory";
import useProcessContextState from "contexts/process/useProcessContextState";

const { Consumer, Provider, useContext } = contextFactory(
  useProcessContextState
);

export {
  Consumer as ProcessConsumer,
  Provider as ProcessProvider,
  useContext as useProcesses,
};
