import dynamic from 'next/dynamic';
import type { Processes } from 'types/contexts/process';

const processDirectory: Processes = {
  HelloWorld: {
    Component: dynamic(() => import('components/apps/HelloWorld')),
    hasWindow: true,
    icon: '/favicon.ico',
    title: 'Hello World'
  }
};

export default processDirectory;
