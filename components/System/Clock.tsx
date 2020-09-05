import styles from '@/styles/System/Clock.module.scss';

import type { FC } from 'react';

import { useEffect, useState } from 'react';
import {
  formatToDate,
  formatToShortDateTime,
  formatToTime,
  isMidnight
} from '@/utils/dateTime';

const millisecondsInSecond = Number(process.env.millisecondsInSecond);

const millisecondsTillNextSecond = () =>
  millisecondsInSecond - new Date().getMilliseconds();

export const Clock: FC = () => {
  const initialDate = new Date(),
    [date, setDate] = useState(formatToDate(initialDate)),
    [time, setTime] = useState(formatToTime(initialDate)),
    [dateTime, setDateTime] = useState(formatToShortDateTime(initialDate)),
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

    setTimeout(() => {
      updateClock();
      clockIntervalId = setInterval(updateClock, millisecondsInSecond);
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
