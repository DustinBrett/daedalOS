import styles from '../styles/Icons.module.scss';

import Icon from './Icon';

import type { Apps } from '../resources/apps';

type IconType = {
  apps: Apps
};

export default function Icons({ apps }: IconType) {
  return (
    <div className={ styles.icons }>
      { Object.entries(apps)
        .filter(([_id, app]) => app.showIcon)
        .map(([id, app]) => <Icon key={ app.id } icon={ app.icon } name={ app.name } />) }
    </div>
  );
};
