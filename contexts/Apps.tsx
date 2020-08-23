import type { Dispatch, FC } from 'react';
import { createContext, useState } from 'react';
import App from '../contexts/App';
import Blog from '../components/Blog';

export type Apps = Array<App>;

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
