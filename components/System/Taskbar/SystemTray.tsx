import styles from '@/styles/System/SystemTray.module.scss';

import type { FC } from 'react';

import { useBattery } from 'react-use';

export const SystemTray: FC = () => {
  const batteryState = useBattery();

  return (
    <nav className={styles.tray}>
      <ol>
        <li title={`Charging: ${batteryState?.charging ? 'yes' : 'no'}`}>
          {batteryState?.level * 100}%
        </li>
      </ol>
    </nav>
  );
};

export default SystemTray;
