import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type Process from '@/contexts/Process';

export type Processes = Array<Process>;

export type ProcessAction = {
  id?: string;
  process?: Process;
  updates?: Partial<Process>;
};

export type ProcessConstructor = {
  loader: AppLoader;
  icon: string;
  name: string;

  bgColor?: string;
  height?: number;
  hideScrollbars?: boolean;
  id?: string;
  lockAspectRatio?: boolean;
  width?: number;
  windowed?: boolean;
  x?: number;
  y?: number;
};

export type ProcessContextType = {
  processes: Processes;
  close?: (id: string, stackOrder: Array<string>) => void;
  focus?: (id: string, focus?: boolean) => void;
  maximize?: (id: string, maximize?: boolean) => void;
  minimize?: (id: string, minimize?: boolean) => void;
  open?: (url: string, icon: string, name: string) => void;
  position?: (id: string) => RndDragCallback;
  size?: (id: string) => RndResizeCallback;
  title?: (id: string, name?: string) => void;
};
