import type App from '@/contexts/App';

export const lockDocumentTitle = (): void => {
  if (
    typeof Object.getOwnPropertyDescriptor(document, 'title')?.set ===
    'undefined'
  ) {
    Object.defineProperty(document, 'title', { set: () => {} });
  }
};

export const sortByLastRunning = (a: App, b: App): number =>
  a.lastRunning.getTime() - b.lastRunning.getTime();
