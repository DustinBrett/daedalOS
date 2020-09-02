import type {
  DraggableData,
  Rnd,
  RndDragCallback,
  RndDragEvent,
  RndResizeCallback
} from 'react-rnd';
import type { AppAction, Apps } from '@/contexts/Apps';
import type { Dispatch, RefObject } from 'react';

export const appendElement = (
  parentElement: HTMLElement,
  childElement: HTMLElement
): void => {
  if (parentElement && childElement) {
    parentElement.appendChild?.(childElement);
  }
};

export const appToFocus = (
  apps: Apps,
  updateApp: Dispatch<AppAction>,
  id: string
): void => {
  appToForeground(apps, updateApp, id);
  appToStackTop(apps, updateApp, id);
};

export const appToUnfocus = (
  apps: Apps,
  updateApp: Dispatch<AppAction>,
  id: string
): void => appToBackground(apps, updateApp, id);

export const appToBackground = (
  apps: Apps,
  updateApp: Dispatch<AppAction>,
  id: string
): void =>
  updateApp({
    id,
    updates: { foreground: false }
  });

export const appToForeground = (
  apps: Apps,
  updateApp: Dispatch<AppAction>,
  id: string
): void =>
  apps.forEach(({ id: appId }) => {
    updateApp({
      id: appId,
      updates: { foreground: id === appId }
    });
  });

export const appToStackTop = (
  apps: Apps,
  updateApp: Dispatch<AppAction>,
  id: string
): void =>
  apps.forEach(({ id: appId, stackOrder }) => {
    updateApp({
      id: appId,
      updates: {
        stackOrder: [
          id,
          ...stackOrder.filter((windowId: string) => windowId !== id)
        ]
      }
    });
  });

export const focusOnDrag = (
  _event: RndDragEvent,
  { node }: DraggableData
): void => node.focus();

export const lockDocumentTitle = (): void => {
  if (
    typeof Object.getOwnPropertyDescriptor(document, 'title')?.set ===
    'undefined'
  ) {
    Object.defineProperty(document, 'title', { set: () => {} });
  }
};

export const updatePosition = (
  updateApp: Dispatch<AppAction>,
  id: string
): RndDragCallback => (_event, { x, y }): void =>
  updateApp({ id, updates: { x, y } });

export const updateSize = (
  updateApp: Dispatch<AppAction>,
  id: string
): RndResizeCallback => (
  _event,
  _direction,
  { offsetWidth, offsetHeight }
): void =>
  updateApp({ id, updates: { height: offsetHeight, width: offsetWidth } });

export const focusResizableElement = (elementRef: RefObject<Rnd>): void =>
  elementRef?.current?.resizableElement?.current?.focus?.();
