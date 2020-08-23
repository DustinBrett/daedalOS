import { Dispatch, FC, useReducer } from 'react';
import { createContext } from 'react';
import App from '../contexts/App';
import Blog from '../components/Blog';

type Apps = Array<App>;

const initialApps: Apps = [Blog];

export const AppsContext = createContext<{
  apps: Apps;
  updateApps: Dispatch<Apps>;
}>({
  apps: [],
  updateApps: () => null
});

export const AppsProvider: FC = ({ children }) => {
  const [apps, updateApps] = useReducer((apps: Apps) => [...apps], initialApps);

  return (
    <AppsContext.Provider value={{ apps, updateApps }}>
      {children}
    </AppsContext.Provider>
  );
};
