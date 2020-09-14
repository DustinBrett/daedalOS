import type { Dispatch } from 'react';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type { Processes, ProcessAction } from '@/utils/pm.d';

import { Process } from '@/utils/pm';
import { appLoader } from '@/utils/programs';

export const close = (
  processes: Processes,
  updateProcesses: Dispatch<ProcessAction>
) => (id: string, [, nextRemainingProcessId]: Array<string>): void => {
  if (nextRemainingProcessId)
    focus(processes, updateProcesses)(nextRemainingProcessId);

  updateProcesses({ id });
};

// TODO: Focus should not be needed if foreground says what to focus on
export const focus = (
  processes: Processes,
  updateProcesses: Dispatch<ProcessAction>
) => (id: string, toggleFocus = true): void => {
  if (toggleFocus) {
    processes.forEach(({ id: processId, stackOrder }) => {
      updateProcesses({
        id: processId,
        updates: {
          stackOrder: [
            id,
            ...stackOrder.filter((stackId: string) => stackId !== id)
          ]
        }
      });
    });
  }
};

export const maximize = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string,
  toggleMaximized = true
): void => updateProcesses({ updates: { maximized: toggleMaximized }, id });

export const minimize = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string,
  toggleMinimized = true
): void =>
  updateProcesses({
    updates: { minimized: toggleMinimized },
    id
  });

export const open = (
  processes: Processes,
  updateProcesses: Dispatch<ProcessAction>
) => (url: string, icon: string, name: string): string | undefined => {
  const { id: existingProcessId } =
    processes.find(({ name: processName }) => processName === name) || {};

  if (!existingProcessId) {
    const loader = appLoader(url);

    if (loader) {
      const process = new Process({
        loader,
        icon,
        name,
        ...loader.loaderOptions
      });

      updateProcesses({ process });

      return process.id;
    }
  } else {
    focus(processes, updateProcesses)(existingProcessId);

    return existingProcessId;
  }
};

export const position = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string
): RndDragCallback => (_event, { x, y }): void =>
  updateProcesses({ id, updates: { x, y } });

export const size = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string
): RndResizeCallback => (
  _event,
  _direction,
  { offsetWidth: width, offsetHeight: height }
): void => updateProcesses({ id, updates: { height, width } });

export const title = (updateProcesses: Dispatch<ProcessAction>) => (
  id: string,
  name = ''
): void => updateProcesses({ updates: { name }, id });
