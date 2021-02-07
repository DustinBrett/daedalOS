import dynamic from 'next/dynamic';
import type { Processes } from 'types/contexts/process';

const STARTUP_PROCESSES: string[] = ['HelloWorld'];

export const processDirectory: Processes = {
  HelloWorld: {
    Component: dynamic(() => import('components/apps/HelloWorld')),
    hasWindow: true
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
