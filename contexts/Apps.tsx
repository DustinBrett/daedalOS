import type { Dispatch, FC } from 'react';
import { createContext, useState } from 'react';

import Blog from '../components/Blog';

export type AppType = {
  component: FC;
  icon: JSX.Element;
  id: string;
  name: string;

  running?: boolean;
};

type AppsType = Array<AppType>;

type ContextProps = {
  apps: AppsType;
  updateApps: Dispatch<AppsType>;
};

const Apps: AppsType = [Blog];

export const AppsContext = createContext<ContextProps>({
  apps: Apps,
  updateApps: () => null
});

export const AppsProvider: FC = ({ children }) => {
  const [apps, updateApps] = useState(Apps);

  return (
    <AppsContext.Provider value={{ apps, updateApps }}>
      {children}
    </AppsContext.Provider>
  );
};
