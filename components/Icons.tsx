import styles from '../styles/Icons.module.scss';

import Icon from './Icon';

import apps from '../services/apps';

export default function Icons() {
  return (
    <div className={ styles.icons }>
      { apps
        .filter(app => app.showIcon)
        .map(app => <Icon key={ app.id } id={ app.id } />) }
    </div>
  );
};
