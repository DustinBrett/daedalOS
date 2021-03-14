import dynamic from 'next/dynamic';

export type Process = {
  Component: React.ComponentType;
  hasWindow?: boolean;
  icon: string;
  maximize?: boolean;
  minimize?: boolean;
  title: string;
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
  }
};

export default processDirectory;
