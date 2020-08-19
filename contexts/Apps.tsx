import type { FC, ReactNode } from "react";
import { createContext, useReducer } from 'react';
import { Blog } from '../components/Blog';
import BlogIcon from '../assets/svg/blog.svg';

export type AppType = {
  component: ReactNode,
  icon: JSX.Element,
  id: string,
  name: string,
  running: boolean
};

export type AppsType = Array<AppType>;

export type ContextProps = {
  apps?: AppsType,
  updateApp?: Function
};

const Apps: AppsType = [
  {
    component: <Blog />,
    icon: <BlogIcon />,
    id: 'blog',
    name: 'Blog',
    running: true
  }
];

export const AppsContext = createContext<ContextProps>({
  apps: Apps,
  updateApp: undefined
});

export const AppsProvider: FC = ({ children }) => {
  const [apps, updateApp] = useReducer(
    (apps: AppsType, updatedApp: AppType) =>
      apps.map(app => app.id === updatedApp.id ? updatedApp : app),
    Apps
  );

  return <AppsContext.Provider value={{ apps, updateApp }} children={ children } />;
};
