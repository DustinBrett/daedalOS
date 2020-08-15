import { createContext, useState, useReducer } from 'react';
import { apps as initialApps } from '../resources/apps';

export const AppsContext = createContext(initialApps);

export const AppsProvider = props => {
  const [apps, updateApp] = useReducer((apps, { id, ...update }) => ({
    ...apps,
    [id]: {
      ...apps[id],
      ...update
    }
  }), initialApps);

  return <AppsContext.Provider value={{ apps, updateApp }} {...props} />;
};
