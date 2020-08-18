import type { FC } from 'react';
import { useEffect, useState } from 'react';
import styles from '../styles/Clock.module.scss';

const

  getDate = () =>
    new Intl.DateTimeFormat(process.env.locale, {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric'
    }).format(new Date()),

  getTime = ({ hour12 }: { hour12: boolean }) =>
    new Intl.DateTimeFormat(process.env.locale, {
      hour12,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date());

export const Clock: FC = () => {
  const [date, setDate] = useState(''),
    [time12, setTime12] = useState(''),
    [time24, setTime24] = useState(''),
    updateClock = () => {
      setTime12(getTime({ hour12: true }));
      setTime24(getTime({ hour12: false }));

      if (!date || time24 === '00:00:00') {
        setDate(getDate());
      }
    };

  useEffect(updateClock, []);

  useEffect(() => {
    const clockIntervalId = setInterval(updateClock, Number(process.env.millisecondsInSecond));

    return () => clearInterval(clockIntervalId);
  }, []);

  return (
    <time
      className={ styles.clock }
      dateTime={ time24 }
      title={ date }
    >
      { time12 }
    </time>
  );
};
