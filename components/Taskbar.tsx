import styles from '../styles/Taskbar.module.scss';

import { Clock } from './Clock';

export default function Taskbar() {
  return (
    <div className={ styles.taskbar }>
      <Clock hour12={ true } />
    </div>
  );
};
