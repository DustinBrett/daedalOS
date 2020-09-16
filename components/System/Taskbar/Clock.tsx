import styles from '@/styles/System/Taskbar/Clock.module.scss';

import type { FC } from 'react';

import { useEffect, useState } from 'react';
import {
  formatToDate,
  formatToShortDateTime,
  formatToTime,
  isMidnight,
  newDate
} from '@/utils/dates';
import { MILLISECONDS_IN_SECOND } from '@/utils/constants';

const millisecondsTillNextSecond = () =>
  MILLISECONDS_IN_SECOND - newDate().getMilliseconds();

export const Clock: FC = () => {
  const initialDate = newDate(),
    [date, setDate] = useState(formatToDate(initialDate)),
    [time, setTime] = useState(formatToTime(initialDate)),
    [dateTime, setDateTime] = useState(formatToShortDateTime(initialDate)),
    updateClock = () => {
      const currentDate = newDate(),
        newTime = formatToTime(currentDate);

      setTime(newTime);

      if (isMidnight(newTime)) {
        setDate(formatToDate(currentDate));
        setDateTime(formatToShortDateTime(currentDate));
      }
    };

  useEffect(() => {
    let clockIntervalId: NodeJS.Timeout;

    setTimeout(() => {
      updateClock();
      clockIntervalId = setInterval(updateClock, MILLISECONDS_IN_SECOND);
    }, millisecondsTillNextSecond());

    return () => {
      clearInterval(clockIntervalId);
    };
  }, []);

  return (
    <time
      className={styles.clock}
      dateTime={dateTime}
      title={date}
      suppressHydrationWarning={true}
    >
      {time}
    </time>
  );
};

export default Clock;
