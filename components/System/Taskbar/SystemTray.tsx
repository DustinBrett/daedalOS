import styles from '@/styles/System/SystemTray.module.scss';

import type { FC } from 'react';

import { useEffect, useState } from 'react';
import { useBattery } from 'react-use';
import { BatteryState } from 'react-use/lib/useBattery';

// TODO: Extract out this battery element from the system tray which will contain network/volume some day too

type UseBatteryState = BatteryState & { isSupported: true; fetched: true };

export const SystemTray: FC = () => {
  const batteryState = useBattery(),
    [batteryLevel, setBatteryLevel] = useState(-1),
    [batteryCharging, setBatteryCharging] = useState(false);

  useEffect(() => {
    const {
      isSupported,
      fetched,
      level,
      charging
    }: UseBatteryState = (batteryState || {}) as UseBatteryState;

    if (isSupported && fetched) {
      setBatteryLevel(level);
      setBatteryCharging(charging);
    }
  }, [batteryState]);

  return (
    <nav className={styles.tray}>
      <ol>
        <li title={`Charging: ${batteryCharging ? 'yes' : 'no'}`}>
          {batteryLevel >= 0 ? batteryLevel * 100 : '?'}%
        </li>
      </ol>
    </nav>
  );
};

export default SystemTray;
