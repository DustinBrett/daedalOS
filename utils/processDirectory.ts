import Taskbar from 'components/system/Taskbar';
import dynamic from 'next/dynamic';
import type { Processes } from 'types/contexts/process';

const STARTUP_PROCESSES: string[] = ['HelloWorld', 'Taskbar'];

export const processDirectory: Processes = {
  HelloWorld: {
    Component: dynamic(() => import('components/apps/HelloWorld')),
    hasWindow: true
  },
  Taskbar: {
    Component: Taskbar
  }
};

export const getStartupProcesses = (): Processes =>
  STARTUP_PROCESSES.reduce(
    (processes, processId) => ({
      ...processes,
      [processId]: processDirectory[processId]
    }),
    {}
  );
