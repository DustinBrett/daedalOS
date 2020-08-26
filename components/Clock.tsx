import type { FC } from 'react';
import styles from '../styles/Clock.module.scss';
import { useEffect, useReducer } from 'react';

const getDate = () =>
  new Intl.DateTimeFormat(process.env.locale, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric'
  }).format(new Date());

const getTime = () =>
  new Intl.DateTimeFormat(process.env.locale, {
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date());

export const Clock: FC = () => {
  const [date, updateDate] =  useReducer(getDate, getDate()),
    [time, updateTime] = useReducer(getTime, ''),
    updateClock = () => {
      updateTime();

      if (!date || time === '12:00:00 AM') {
        updateDate();
      }
    };

  useEffect(updateClock, []);

  useEffect(() => {
    const clockIntervalId = setInterval(
      updateClock,
      Number(process.env.millisecondsInSecond)
    );

    return () => clearInterval(clockIntervalId);
  }, []);

  return (
    <time className={styles.clock} title={date}>
      {time}
    </time>
  );
};
