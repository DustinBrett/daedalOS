import dynamic from 'next/dynamic';
import type { Processes } from 'types/contexts/process';

// TODO: Check type errors on pre-commit

const processDirectory: Processes = {
  HelloWorld: {
    Component: dynamic(() => import('components/apps/HelloWorld')),
    hasWindow: true
  }
};

export default processDirectory;
