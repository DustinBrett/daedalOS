import type { ComponentType } from 'react';

export type Process = {
  Component: ComponentType;
};

export type Processes = {
  [id: string]: Process;
};
