import styles from '../styles/Icon.module.scss';

import apps from '../services/apps';

export default function Icon({ id }) {
  const { icon, name } = apps.find(app => app.id === id);

  return (
    <div className={ styles.icon }>
      { icon }
      { name }
    </div>
  );
};
