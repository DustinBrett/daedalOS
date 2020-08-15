import styles from '../styles/Icons.module.scss';
import { useContext } from 'react';
import { AppsContext } from '../resources/AppsProvider';
import Icon from './Icon';

// selected state/class here with style, selected, hover, selected + hover
export default function Icons() {
  const { apps = {} } = useContext(AppsContext);

  return (
    <div className={ styles.icons }>
      { Object.entries(apps)
        .filter(([_id, app]) => app.component)
        .map(([id, app]) =>
          <Icon key={ app.id } icon={ app.icon } id={ id } name={ app.name } />) }
    </div>
  );
};
