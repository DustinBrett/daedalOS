import styles from '../styles/Icons.module.scss';

import Icon from './Icon';

import { Apps } from '../resources/apps';

export default function Icons() {
  return (
    <div className={ styles.icons }>
      { Apps
        .filter(app => app.showIcon)
        .map(app => <Icon key={ app.id } { ...app } />) }
    </div>
  );
};
