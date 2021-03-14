import type { ProcessContextState } from 'hooks/useProcessContextState';
import useProcessContextState from 'hooks/useProcessContextState';
import contextFactory from 'utils/contextFactory';
import { initialProcessContextState } from 'utils/initialContextStates';

const { Consumer, Provider, useContext } = contextFactory<ProcessContextState>(
  initialProcessContextState,
  useProcessContextState
);

export {
  Consumer as ProcessConsumer,
  Provider as ProcessProvider,
  useContext as useProcesses
};
