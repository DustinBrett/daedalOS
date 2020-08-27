import { Dispatch, FC, useReducer } from 'react';
import { createContext } from 'react';
import App from '@/contexts/App';

import Blog from '@/components/Blog';
import CommanderKeen1 from '@/components/Games/CommanderKeen1';

type Apps = Array<App>;

type AppAction = {
  update: { [key: string]: boolean };
  id: string;
};

const initialApps: Apps = [Blog, CommanderKeen1];

const appReducer = (apps: Apps, { update, id }: AppAction) =>
  apps.map((app) => (app.id === id ? { ...app, ...update } : app));

export const AppsContext = createContext<{
  apps: Apps;
  updateApps: Dispatch<AppAction>;
}>({
  apps: [],
  updateApps: () => null
});

export const AppsProvider: FC = ({ children }) => {
  const [apps, updateApps] = useReducer(appReducer, initialApps);

  return (
    <AppsContext.Provider value={{ apps, updateApps }}>
      {children}
    </AppsContext.Provider>
  );
};
