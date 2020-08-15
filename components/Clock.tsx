import styles from '../styles/Clock.module.scss';
import { useEffect, useState } from 'react';
import { LOCALE, SECOND_IN_MILLISECONDS } from '../resources/constants'; // TODO: More constants

const

  getDate = () =>
    new Intl.DateTimeFormat(LOCALE, {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric'
    }).format(new Date()),

  getTime = ({ hour12 = false }) =>
    new Intl.DateTimeFormat(LOCALE, {
      hour12,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date());

type ClockType = {
  hour12?: boolean
};

export default function Clock({ hour12 }: ClockType) {
  const [date, setDate] = useState(''),
    [time, setTime] = useState(''),
    midnight = hour12 ? '12:00:00 AM' : '00:00:00',
    updateClock = () => {
      setTime(getTime({ hour12 }));

      if (!date || time === midnight) {
        setDate(getDate());
      }
    };

  useEffect(updateClock, []);

  useEffect(() => {
    const clockInterval = setInterval(updateClock, SECOND_IN_MILLISECONDS);

    return () => { clearInterval(clockInterval) };
  }, []);

  return (
    <div className={ styles.clock } title={ date }>
      { time }
    </div>
  );
};
