import type {
  DraggableData,
  Rnd,
  RndDragCallback,
  RndDragEvent,
  RndResizeCallback
} from 'react-rnd';
import type { AppAction, Apps } from '@/contexts/Apps';
import type { Dispatch, RefObject } from 'react';

import App from '@/contexts/App';
import { getAppComponent } from '@/utils/apps';

const appToBackground = (
  apps: Apps,
  updateApp: Dispatch<AppAction>,
  id: string
): void =>
  updateApp({
    id,
    updates: { foreground: false }
  });

const appToForeground = (
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

const appToStackTop = (
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

export const appendElement = (
  parentElement: HTMLElement,
  childElement: HTMLElement
): void => {
  if (parentElement && childElement) {
    parentElement.appendChild?.(childElement);
  }
};

export const appFocus = (apps: Apps, updateApp: Dispatch<AppAction>) => (
  id: string,
  focus = true
): void => {
  if (focus) {
    appToForeground(apps, updateApp, id);
    appToStackTop(apps, updateApp, id);
  } else {
    appToBackground(apps, updateApp, id);
  }
};

export const appMinimize = (updateApp: Dispatch<AppAction>) => (
  id: string,
  minimize = true
): void => {
  if (minimize) {
    updateApp({ updates: { foreground: false, minimized: true }, id });
  } else {
    updateApp({ updates: { minimized: false }, id });
  }
};

export const appClose = (apps: Apps, updateApp: Dispatch<AppAction>) => (
  id: string,
  [, newForegroundAppId]: Array<string> // TODO: Does this logic make sense?
): void => {
  if (newForegroundAppId) {
    appFocus(apps, updateApp)(newForegroundAppId);
  }

  updateApp({ updates: { running: false, stackOrder: [] }, id });
};

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

export const appPosition = (updateApp: Dispatch<AppAction>) => (
  id: string
): RndDragCallback => (_event, { x, y }): void =>
  updateApp({ id, updates: { x, y } });

export const appSize = (updateApp: Dispatch<AppAction>) => (
  id: string
): RndResizeCallback => (
  _event,
  _direction,
  { offsetWidth, offsetHeight }
): void =>
  updateApp({ id, updates: { height: offsetHeight, width: offsetWidth } });

export const appOpen = (updateApp: Dispatch<AppAction>) => (
  url: string,
  icon: string,
  name: string
): void => {
  const component = getAppComponent(url);

  if (component) {
    updateApp({
      app: new App({
        component,
        icon,
        name,

        // DOS Options (How can these be passed?)
        hideScrollbars: true,
        lockAspectRatio: true,
        width: 320,
        height: 224
      })
    });
  }
};

export const focusResizableElementRef = (elementRef: RefObject<Rnd>): void =>
  elementRef?.current?.resizableElement?.current?.focus?.();

export const sortByLastRunning = (a: App, b: App): number =>
  a.lastRunning.getTime() - b.lastRunning.getTime();
