import contextActionSelectorFactory from "contexts/contextActionSelectorFactory";
import { type Process, type Processes } from "contexts/process/types";
import useProcessContextState from "contexts/process/useProcessContextState";

const NO_PROCESS = Object.create(null) as Process;

export const hasProcess = (process: Process): boolean => process !== NO_PROCESS;

const { getCurrentState, Provider, useContextActions, useStateSelector } =
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

// Non-subscribing reads for handlers and same-commit mounts
export const getProcesses = (): Processes => getCurrentState().processes;

export const getProcess = (id: string): Process | undefined =>
  getCurrentState().processes[id];

export {
  Provider as ProcessProvider,
  useContextActions as useProcessesActions,
};
