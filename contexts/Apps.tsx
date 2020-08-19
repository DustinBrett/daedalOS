import type { Dispatch, FC } from "react";
import { createContext, useState } from 'react';
import { Blog } from '../components/Blog';
import BlogIcon from '../assets/svg/blog.svg';

export type AppType = {
  component: FC,
  enabled?: boolean,
  icon: JSX.Element,
  id: string,
  name: string,
  running?: boolean,
  selectedIcon?: boolean
};

type AppsType = Array<AppType>;

type ContextProps = {
  apps: AppsType,
  updateApps: Dispatch<AppsType>
};

const Apps: AppsType = [
  {
    component: Blog,
    enabled: true,
    icon: <BlogIcon />,
    id: 'blog',
    name: 'Blog',
    running: true
  }
];

export const AppsContext = createContext<ContextProps>({
  apps: Apps,
  updateApps: () => null
});

export const AppsProvider: FC = ({ children }) => {
  const [apps, updateApps] = useState(Apps);

  return (
    <AppsContext.Provider value={{ apps, updateApps }}>
      { children }
    </AppsContext.Provider>
  );
};
