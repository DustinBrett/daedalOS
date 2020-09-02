import type { Dispatch, FC } from 'react';

import { createContext, useReducer } from 'react';
import App from '@/contexts/App';
import Files from '@/components/Apps/Files';
import DOS from '@/components/Apps/Dos';
import CommanderKeen from '@/components/Apps/Games/CommanderKeen';
import Doom from '@/components/Apps/Games/Doom';
import Winamp from '@/components/Apps/Winamp';

export type Apps = Array<App>;

export type AppAction = {
  updates: Partial<App>;
  id: string;
};

const initialApps: Apps = [Files, DOS, CommanderKeen, Doom, Winamp];

const appReducer = (apps: Apps, { updates, id }: AppAction) =>
  apps.map((app) => (app.id === id ? { ...app, ...updates } : app));

export const AppsContext = createContext<{
  apps: Apps;
  updateApp: Dispatch<AppAction>;
}>({
  apps: [],
  updateApp: () => null
});

export const AppsProvider: FC = ({ children }) => {
  const [apps, updateApp] = useReducer(appReducer, initialApps);

  return (
    <AppsContext.Provider value={{ apps, updateApp }}>
      {children}
    </AppsContext.Provider>
  );
};
