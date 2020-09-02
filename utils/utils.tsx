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
    updates: { foreground: false },
    id
  });

export const appToForeground = (
  apps: Apps,
  updateApp: Dispatch<AppAction>,
  id: string
): void =>
  apps.forEach(({ id: appId }) => {
    updateApp({
      updates: { foreground: id === appId },
      id: appId
    });
  });

export const appToStackTop = (
  apps: Apps,
  updateApp: Dispatch<AppAction>,
  id: string
): void =>
  apps.forEach(({ id: appId, stackOrder }) => {
    updateApp({
      updates: {
        stackOrder: [
          id,
          ...stackOrder.filter((windowId: string) => windowId !== id)
        ]
      },
      id: appId
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
  updateApp({ updates: { x, y }, id });

export const updateSize = (
  updateApp: Dispatch<AppAction>,
  id: string
): RndResizeCallback => (
  _event,
  _direction,
  { offsetWidth, offsetHeight }
): void =>
  updateApp({ updates: { height: offsetHeight, width: offsetWidth }, id });

export const focusResizableElement = (elementRef: RefObject<Rnd>): void =>
  elementRef?.current?.resizableElement?.current?.focus?.();
