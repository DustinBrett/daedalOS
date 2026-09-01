import contextActionSelectorFactory from "contexts/contextActionSelectorFactory";
import { type Process, type Processes } from "contexts/process/types";
import useProcessContextState from "contexts/process/useProcessContextState";

const NO_PROCESS = Object.create(null) as Process;

export const hasProcess = (process: Process): boolean => process !== NO_PROCESS;

const { Provider, useContextActions, useStateSelector } =
  contextActionSelectorFactory(useProcessContextState);

export const useNextFocusableId = (id: string, stackOrder: string[]): string =>
  useStateSelector(
    (state) =>
      stackOrder.find(
        (stackId) => stackId !== id && !state.processes[stackId]?.minimized
      ) || ""
  );

export const useProcess = (id: string): Process =>
  useStateSelector((state) => state.processes[id] || NO_PROCESS);

export const useProcesses = (): Processes =>
  useStateSelector((state) => state.processes);

export const useProcessesRef = (): React.RefObject<Processes> =>
  useStateSelector((state) => state.processesRef);

export {
  Provider as ProcessProvider,
  useContextActions as useProcessesActions,
};
