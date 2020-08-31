import type { DraggableData, RndDragEvent } from 'react-rnd';
import type { AppAction, Apps } from '@/contexts/Apps';
import type { Dispatch } from 'react';

export const appendElement = (
  parentElement: HTMLElement,
  childElement: HTMLElement
): void => {
  if (parentElement && childElement) {
    parentElement.appendChild(childElement);
  }
};

export const appToFocus = (
  apps: Apps,
  updateApps: Dispatch<AppAction>,
  id: string
): void => {
  appToForeground(apps, updateApps, id);
  appToStackTop(apps, updateApps, id);
};

export const appToForeground = (
  apps: Apps,
  updateApps: Dispatch<AppAction>,
  id: string
): void => {
  apps.forEach(({ id: appId }) => {
    updateApps({
      update: { foreground: id === appId },
      id: appId
    });
  });
};

export const appToStackTop = (
  apps: Apps,
  updateApps: Dispatch<AppAction>,
  id: string
): void => {
  apps.forEach(({ id: appId, stackOrder }) => {
    updateApps({
      update: {
        stackOrder: [
          id,
          ...stackOrder.filter((windowId: string) => windowId !== id)
        ]
      },
      id: appId
    });
  });
};

export const focusOnDrag = (
  _event: RndDragEvent,
  { node }: DraggableData
): void => {
  node.focus();
};

export const lockDocumentTitle = (): void => {
  if (
    typeof Object.getOwnPropertyDescriptor(document, 'title')?.set ===
    'undefined'
  ) {
    Object.defineProperty(document, 'title', { set: () => {} });
  }
};
