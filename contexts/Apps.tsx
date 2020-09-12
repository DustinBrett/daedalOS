import type { FC } from 'react';
import type { RndDragCallback, RndResizeCallback } from 'react-rnd';
import type App from '@/contexts/App';

import { createContext, useReducer } from 'react';
import {
  appClose,
  appFocus,
  appMaximize,
  appMinimize,
  appOpen,
  appPosition,
  appSize,
  appTitle
} from '@/utils/apps';

export type Apps = Array<App>;

export type AppAction = {
  app?: App;
  updates?: Partial<App>;
  id?: string;
};

type AppsContextType = {
  apps: Apps;
  close?: (id: string, stackOrder: Array<string>) => void;
  focus?: (id: string, focus?: boolean) => void;
  maximize?: (id: string, maximize?: boolean) => void;
  minimize?: (id: string, minimize?: boolean) => void;
  open?: (url: string, icon: string, name: string) => void;
  position?: (id: string) => RndDragCallback;
  size?: (id: string) => RndResizeCallback;
  title?: (id: string, name: string) => void;
};

const initialApps: Apps = [];
const appStates: { [key: string]: Partial<App> } = {};

const appReducer = (apps: Apps, { app, updates, id }: AppAction) => {
  if (app) {
    return [...apps, { ...app, ...(appStates[app.id] || {}) }];
  } else if (updates) {
    return apps.map((app) => (app.id === id ? { ...app, ...updates } : app));
  } else if (id) {
    const { x, y, height, width } = apps.find((app) => app.id === id) || {};

    appStates[id] = { x, y, height, width };

    return apps.filter((app) => app.id !== id);
  }

  return apps;
};

export const AppsContext = createContext<AppsContextType>({
  apps: []
});

export const AppsProvider: FC = ({ children }) => {
  const [apps, updateApp] = useReducer(appReducer, initialApps);

  return (
    <AppsContext.Provider
      value={{
        apps,
        close: appClose(apps, updateApp),
        focus: appFocus(apps, updateApp),
        maximize: appMaximize(updateApp),
        minimize: appMinimize(updateApp),
        open: appOpen(updateApp),
        position: appPosition(updateApp),
        size: appSize(updateApp),
        title: appTitle(updateApp)
      }}
    >
      {children}
    </AppsContext.Provider>
  );
};

export default AppsProvider;
