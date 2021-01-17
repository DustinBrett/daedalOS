import dynamic from 'next/dynamic';

const processDirectory = {
  HelloWorld: {
    Component: dynamic(() => import('components/apps/HelloWorld'))
  }
};

export default processDirectory;
