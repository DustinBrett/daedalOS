import type { FC } from 'react';
import styles from '../styles/TaskbarEntry.module.scss';
// import { AppsContext } from '../resources/AppsProvider';
// import styles from '../styles/TaskbarEntry.module.scss';

export const TaskbarEntry: FC = ({ icon, name }) => {
  // const { apps = {}, updateApp = () => {} } = useContext(AppsContext),
  //   toggleAppMinimized = () => (updateApp as Function)({ id, minimized: !apps[id].minimized });

  return (
    <li className={ styles.taskbarEntry }>
      { icon }
      { name }
    </li>
  );
};
