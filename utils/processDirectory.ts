import dynamic from 'next/dynamic';
import type { Process } from 'types/contexts/process';

/* eslint import/prefer-default-export: off */
export const HelloWorld: Process = {
  Component: dynamic(() => import('components/apps/HelloWorld')),
  hasWindow: true,
  icon: '/favicon.ico',
  title: 'Hello World'
};
