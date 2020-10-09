import styles from '@/styles/System/Taskbar/Clock.module.scss';

import {
  formatToDate,
  formatToShortDateTime,
  formatToTime,
  isMidnight,
  newDate
} from '@/utils/dates';
import { memo, useEffect, useState } from 'react';
import { MILLISECONDS_IN_SECOND } from '@/utils/constants';

const millisecondsTillNextSecond = () =>
  MILLISECONDS_IN_SECOND - newDate().getMilliseconds();

const Clock: React.FC = () => {
  const initialDate = newDate();
  const [date, setDate] = useState(formatToDate(initialDate));
  const [time, setTime] = useState(formatToTime(initialDate));
  const [dateTime, setDateTime] = useState(formatToShortDateTime(initialDate));
  const updateClock = () => {
    const currentDate = newDate();
    const newTime = formatToTime(currentDate);

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
      suppressHydrationWarning
    >
      {time}
    </time>
  );
};

export default memo(Clock);
