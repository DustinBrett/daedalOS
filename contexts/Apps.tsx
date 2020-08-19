import type { Dispatch, FC } from 'react';
import { createContext, useState } from 'react';

import Blog from '../components/Blog';

export type App = {
  component: FC;
  icon: JSX.Element;
  id: string;
  name: string;

  running?: boolean;
};

type Apps = Array<App>;

type ContextProps = {
  apps: Apps;
  updateApps: Dispatch<Apps>;
};

const initialApps: Apps = [Blog];

export const AppsContext = createContext<ContextProps>({
  apps: [],
  updateApps: () => null
});

export const AppsProvider: FC = ({ children }) => {
  const [apps, updateApps] = useState(initialApps);

  return (
    <AppsContext.Provider value={{ apps, updateApps }}>
      {children}
    </AppsContext.Provider>
  );
};
