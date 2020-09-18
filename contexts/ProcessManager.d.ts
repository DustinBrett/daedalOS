import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type { Processes } from '@/utils/pm.d';
import type { AppFile } from '@/utils/programs.d';

// TODO: Do any of these need to return id's?

export type ProcessContextType = {
  processes: Processes;
  close?: (id: string, stackOrder: Array<string>) => string | undefined;
  load?: (file: File) => Promise<string | undefined>;
  maximize?: (id: string) => void;
  minimize?: (id: string, stackOrder: Array<string>) => string | undefined;
  open?: (appFile: AppFile) => string | undefined;
  position?: (id: string) => RndDragCallback;
  restore?: (id: string) => void;
  size?: (id: string) => RndResizeCallback;
  title?: (id: string, name?: string) => void;
};
