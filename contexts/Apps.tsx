import type { FC } from 'react';

import { createContext, useReducer } from 'react';
import App from '@/contexts/App';
import {
  appClose,
  appFocus,
  appMinimize,
  appOpen,
  appPosition,
  appSize
} from '@/utils/utils';

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
  minimize?: (id: string, minimize?: boolean) => void;
  open?: (url: string, icon: string, name: string) => void;
  position?: (id: string) => void;
  size?: (id: string) => void;
};

const initialApps: Apps = [];

const appReducer = (apps: Apps, { app, updates, id }: AppAction) =>
  app
    ? [...apps, app]
    : updates
    ? apps.map((app) => (app.id === id ? { ...app, ...updates } : app))
    : apps.filter((app) => app.id !== id);

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
        minimize: appMinimize(updateApp),
        open: appOpen(updateApp),
        position: appPosition(updateApp),
        size: appSize(updateApp)
      }}
    >
      {children}
    </AppsContext.Provider>
  );
};
