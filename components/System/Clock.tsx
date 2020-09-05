import styles from '@/styles/System/Clock.module.scss';

import type { FC } from 'react';

import { useEffect, useState } from 'react';
import {
  formatToShortDateTime,
  formatToDate,
  formatToTime,
  isMidnight
} from '@/utils/dateTime';

export const Clock: FC = () => {
  const initDate = new Date(),
    [dateTime, setDateTime] = useState(formatToShortDateTime(initDate)),
    [date, setDate] = useState(formatToDate(initDate)),
    [time, setTime] = useState(formatToTime(initDate)),
    updateClock = () => {
      const currentDate = new Date(),
        newTime = formatToTime(currentDate);

      setTime(newTime);

      if (isMidnight(newTime)) {
        setDate(formatToDate(currentDate));
        setDateTime(formatToShortDateTime(currentDate));
      }
    };

  useEffect(() => {
    let clockIntervalId: NodeJS.Timeout;
    const millisecondsInSecond = Number(process.env.millisecondsInSecond);

    setTimeout(() => {
      updateClock();
      clockIntervalId = setInterval(updateClock, millisecondsInSecond);
    }, millisecondsInSecond - new Date().getMilliseconds());

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
