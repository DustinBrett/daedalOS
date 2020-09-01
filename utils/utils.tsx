import type {
  DraggableData,
  RndDragCallback,
  RndDragEvent,
  RndResizeCallback
} from 'react-rnd';
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

export const updatePosition = (
  updateApps: Dispatch<AppAction>,
  id: string
): RndDragCallback => (_event, { x, y }): void => {
  updateApps({ update: { x }, id });
  updateApps({ update: { y }, id });
};

export const updateSize = (
  updateApps: Dispatch<AppAction>,
  id: string
): RndResizeCallback => (
  _event,
  _direction,
  { offsetWidth, offsetHeight }
): void => {
  updateApps({ update: { height: offsetHeight }, id });
  updateApps({ update: { width: offsetWidth }, id });
};
