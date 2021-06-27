import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";

export type ProcessElements = {
  componentWindow?: HTMLElement;
  taskbarEntry?: HTMLElement;
};

export type Process = ProcessElements & {
  autoSizing?: boolean;
  backgroundColor?: string;
  closing?: boolean;
  Component: React.ComponentType<ComponentProcessProps>;
  hasWindow?: boolean;
  icon: string;
  lockAspectRatio?: boolean;
  maximized?: boolean;
  minimized?: boolean;
  singleton?: boolean;
  title: string;
  url?: string;
};

export type Processes = {
  [id: string]: Process;
};
