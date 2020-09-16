import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type { Processes } from '@/utils/pm.d';

export type ProcessContextType = {
  processes: Processes;
  close?: (id: string, stackOrder: Array<string>) => string | undefined;
  maximize?: (id: string) => void;
  minimize?: (id: string) => void;
  open?: (url: string, icon: string, name: string) => string | undefined;
  position?: (id: string) => RndDragCallback;
  restore?: (id: string) => void;
  size?: (id: string) => RndResizeCallback;
  title?: (id: string, name?: string) => void;
};
