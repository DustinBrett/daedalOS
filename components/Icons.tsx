import type { FC } from 'react';
import styles from '../styles/Icons.module.scss';
import { AppsContext } from '../contexts/Apps';
import { useContext } from 'react';
import { Icon } from './Icon';

export const Icons: FC = () => {
  const { apps, updateApps } = useContext(AppsContext);

  return (
    <nav className={styles.icons}>
      <ol>
        {apps.map(({ id, icon, name }, index) => (
          <Icon
            key={id}
            icon={icon}
            name={name}
            onDoubleClick={() => updateApps({ update: { running: true }, id })} // TODO: Also unminimize
            tabIndex={index}
          />
        ))}
      </ol>
    </nav>
  );
};
