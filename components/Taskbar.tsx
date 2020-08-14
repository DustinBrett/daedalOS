import styles from '../styles/Taskbar.module.scss';

import type { Apps } from '../resources/apps';

import Clock from './Clock';
import TaskbarEntry from './TaskbarEntry';

type TaskbarType = {
  apps: Apps
};

export default function Taskbar({ apps }: TaskbarType) {
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
