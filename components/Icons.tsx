import styles from '../styles/Icons.module.scss';
import { useContext } from 'react';
import { AppsContext } from '../resources/AppsProvider';
import Icon from './Icon';

export default function Icons() {
  const { apps = {} } = useContext(AppsContext);

  return (
    <div className={ styles.icons }>
      { Object.entries(apps)
        .filter(([_id, app]) => app.showIcon)
        .map(([id, app]) => <Icon key={ app.id } icon={ app.icon } name={ app.name } />) }
    </div>
  );
};
