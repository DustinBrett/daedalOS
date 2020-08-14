import styles from '../styles/Taskbar.module.scss';

import Clock from './Clock';
import TaskbarEntry from './TaskbarEntry';

import { Apps } from '../resources/apps';

export default function Taskbar() {
  return (
    <div className={ styles.taskbar }>
      <div className={ styles.taskbar_entries }>
        { Apps
          .filter(app => app.showWindow)
          .map(app => (
            <TaskbarEntry key={ app.id } icon={ app.icon } name={ app.name } />
        )) }
      </div>
      <Clock hour12={ true } />
    </div>
  );
};
