import type { Processes } from 'contexts/process/types';
import dynamic from 'next/dynamic';

const processDirectory: Processes = {
  FileExplorer: {
    backgroundColor: '#202020',
    Component: dynamic(() => import('components/apps/FileExplorer')),
    icon: '/icons/explorer.png',
    title: 'File Explorer'
  },
  JSDOS: {
    autoSizing: true,
    backgroundColor: '#000',
    Component: dynamic(() => import('components/apps/JSDOS')),
    icon: '/icons/jsdos.png',
    lockAspectRatio: true,
    title: 'js-dos v7'
  },
  V86: {
    autoSizing: true,
    backgroundColor: '#000',
    Component: dynamic(() => import('components/apps/V86')),
    icon: '/icons/v86.png',
    title: 'Virtual x86'
  },
  Webamp: {
    Component: dynamic(() => import('components/apps/Webamp')),
    hasWindow: false,
    icon: '/icons/webamp.png',
    title: 'Webamp'
  }
};

export default processDirectory;
