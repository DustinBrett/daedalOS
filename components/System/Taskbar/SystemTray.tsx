import styles from '@/styles/System/SystemTray.module.scss';

import type { FC } from 'react';

import { useEffect, useState } from 'react';
import { useBattery } from 'react-use';
import { BatteryState } from 'react-use/lib/useBattery';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBatteryEmpty,
  faBatteryQuarter,
  faBatteryHalf,
  faBatteryThreeQuarters,
  faBatteryFull,
  faBolt
} from '@fortawesome/free-solid-svg-icons';

type UseBatteryState = BatteryState & { isSupported: true; fetched: true };

const getBatteryIcon = (level: number) => {
  if (level === 1) {
    return faBatteryFull;
  } else if (level >= 0.75) {
    return faBatteryThreeQuarters;
  } else if (level >= 0.5) {
    return faBatteryHalf;
  } else if (level >= 0.25) {
    return faBatteryQuarter;
  } else {
    return faBatteryEmpty;
  }
};

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
        <li
          title={`Level: ${batteryLevel * 100}%\nCharging: ${
            batteryCharging ? 'Yes' : 'No'
          }`}
        >
          {batteryCharging ? (
            <span className="fa-layers fa-fw">
              <FontAwesomeIcon icon={getBatteryIcon(batteryLevel)} />
              <FontAwesomeIcon
                size="1x"
                icon={faBolt}
                style={{ color: '#f8f8ff' }}
              />
            </span>
          ) : (
            <FontAwesomeIcon icon={getBatteryIcon(batteryLevel)} />
          )}
        </li>
      </ol>
    </nav>
  );
};

export default SystemTray;
