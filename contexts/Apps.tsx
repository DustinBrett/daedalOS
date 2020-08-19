import type { FC, ReactNode } from "react";
import { createContext, useReducer } from 'react';
import { Blog } from '../components/Blog';
import BlogIcon from '../assets/svg/blog.svg';

const Apps: AppsType = [
  {
    component: <Blog />,
    icon: <BlogIcon />,
    id: 'blog',
    name: 'Blog',
    running: true
  }
];

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

export const AppsContext = createContext<ContextProps>({
  apps: undefined,
  updateApp: undefined
});

export const AppsProvider: FC = ({ children }) => {
  const [apps, updateApp] = useReducer((apps: AppsType, updatedApp: AppType) => {
    apps[apps.findIndex(app => app.id === updatedApp.id)] = updatedApp;

    return apps;
  }, Apps);

  return <AppsContext.Provider value={{ apps, updateApp }} { ...children } />;
};
