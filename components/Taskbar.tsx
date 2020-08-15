import styles from '../styles/Taskbar.module.scss';
import { useContext } from 'react';
import { AppsContext } from '../resources/AppsProvider';
import Clock from './Clock';
import TaskbarEntry from './TaskbarEntry';

export default function Taskbar() {
  const { apps = {} } = useContext(AppsContext);

  return (
    <div className={ styles.taskbar }>
      <div className={ styles.taskbar_entries }>
        { Object.entries(apps)
          .filter(([_id, app]) => app.showWindow)
          .map(([_id, app]) => (
            <TaskbarEntry key={ app.id } icon={ app.icon } name={ app.name } />
        )) }
      </div>
      <Clock hour12={ true } />
    </div>
  );
};
