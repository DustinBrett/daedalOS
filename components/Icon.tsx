import styles from '../styles/Icon.module.scss';

import type { AppType } from '../resources/apps';

export default function Icon({ icon, name }: AppType) {
  return (
    <div className={ styles.icon }>
      { icon }
      { name }
    </div>
  );
};
