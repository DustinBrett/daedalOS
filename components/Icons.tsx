import type { FC } from 'react';
import { useContext } from 'react';
import { Icon } from './Icon';
import { AppsContext } from '../contexts/Apps';
import styles from '../styles/Icons.module.scss';

export const Icons: FC = () => (
  <nav className={ styles.icons }>
    <ol className={ styles.iconEntries }>
      { useContext(AppsContext)
        .apps
        .map(app => <Icon key={ app.id } { ...app } />)
      }
    </ol>
  </nav>
);
