import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type { Processes } from '@/utils/pm.d';

export type ProcessContextType = {
  processes: Processes;
  close?: (id: string, stackOrder: Array<string>) => string | undefined;
  maximize?: (id: string, maximize?: boolean) => void;
  minimize?: (id: string, minimize?: boolean) => void;
  open?: (url: string, icon: string, name: string) => string | undefined;
  position?: (id: string) => RndDragCallback;
  size?: (id: string) => RndResizeCallback;
  title?: (id: string, name?: string) => void;
};
