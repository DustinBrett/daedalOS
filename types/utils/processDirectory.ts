import type { ComponentType } from 'react';

export type Process = {
  Component: any; // ComponentType
};

export type Processes = {
  [id: string]: Process;
};
