import type { ProcessComponentProps } from 'components/system/Processes/RenderProcess';
import dynamic from 'next/dynamic';

export type Process = {
  autoSizing?: boolean;
  backgroundColor?: string;
  Component: React.ComponentType<ProcessComponentProps>;
  hasWindow?: boolean;
  icon: string;
  maximized?: boolean;
  minimized?: boolean;
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
  V86: {
    autoSizing: true,
    backgroundColor: '#000',
    Component: dynamic(() => import('components/apps/V86')),
    hasWindow: true,
    icon: '/icons/v86.ico',
    title: 'v86'
  }
};

export default processDirectory;
