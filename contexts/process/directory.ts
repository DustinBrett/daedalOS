import type { ProcessComponentProps } from 'components/system/Processes/RenderProcess';
import dynamic from 'next/dynamic';

export type ProcessElements = {
  taskbarEntry?: HTMLElement;
};

export type ProcessToggles = {
  maximized?: boolean;
  minimized?: boolean;
};

export type Process = ProcessElements &
  ProcessToggles & {
    autoSizing?: boolean;
    backgroundColor?: string;
    Component: React.ComponentType<ProcessComponentProps>;
    hasWindow?: boolean;
    icon: string;
    title: string;
    url?: string;
  };

export type Processes = {
  [id: string]: Process;
};

const processDirectory: Processes = {
  HelloWorld: {
    Component: dynamic(() => import('components/apps/HelloWorld')),
    hasWindow: true,
    icon: '/favicon.ico',
    title: 'Hello World'
  },
  JSDOS: {
    autoSizing: true,
    backgroundColor: '#000',
    Component: dynamic(() => import('components/apps/JSDOS')),
    hasWindow: true,
    icon: '/icons/jsdos.png',
    title: 'JS-DOS'
  },
  V86: {
    autoSizing: true,
    backgroundColor: '#000',
    Component: dynamic(() => import('components/apps/V86')),
    hasWindow: true,
    icon: '/icons/v86.png',
    title: 'v86'
  }
};

export default processDirectory;
