import type { FC } from 'react';
import styles from '../styles/Clock.module.scss';
import { useEffect, useState } from 'react';

const getDate = () =>
  new Intl.DateTimeFormat(process.env.locale, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric'
  }).format(new Date());

const getTime = ({ hour12 = false }) =>
  new Intl.DateTimeFormat(process.env.locale, {
    hour12,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date());

// TODO: 1 second behind?
export const Clock: FC = () => {
  const [date, setDate] = useState(getDate()),
    [time, setTime] = useState({ hour12: '', hour24: '' }),
    updateClock = () => {
      setTime({
        hour12: getTime({ hour12: true }),
        hour24: getTime({ hour12: false })
      });

      if (!date || time.hour24 === '00:00:00') {
        setDate(getDate());
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
    <time className={styles.clock} dateTime={time.hour24} title={date}>
      {time.hour12}
    </time>
  );
};
