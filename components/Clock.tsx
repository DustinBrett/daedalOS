import styles from '@/styles/Clock.module.scss';

import type { FC } from 'react';
import { useEffect, useState } from 'react';

const toDateOptions = {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric'
};

const toDateTimeOptions = {
  year: 'numeric',
  day: '2-digit',
  month: '2-digit'
};

const toTimeOptions = {
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
};

type DateTimeFormatParts = {
  [key in Intl.DateTimeFormatPartTypes]: string;
};

const newDateTimeFormat = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(process.env.locale, options);

const partsToObject = (
  acc: DateTimeFormatParts,
  { type, value }: Intl.DateTimeFormatPart
) => ({ ...acc, [type]: value });

const formatToDateTime = (date: Date) => {
  const { year, month, day } = newDateTimeFormat(toDateTimeOptions)
    .formatToParts(date)
    .reduce(partsToObject, {} as DateTimeFormatParts);

  return `${year}-${month}-${day}`;
};

const formatToDate = (date: Date) =>
  newDateTimeFormat(toDateOptions).format(date);

const formatToTime = (date: Date) =>
  newDateTimeFormat(toTimeOptions).format(date);

export const Clock: FC = () => {
  const initDate = new Date(),
    [dateTime, setDateTime] = useState(formatToDateTime(initDate)),
    [date, setDate] = useState(formatToDate(initDate)),
    [time, setTime] = useState(formatToTime(initDate)),
    updateClock = () => {
      const currentDate = new Date();
      const newTime = formatToTime(currentDate);

      setTime(newTime);

      if (newTime === '12:00:00 AM') {
        setDate(formatToDate(currentDate));
        setDateTime(formatToDateTime(currentDate));
      }
    };

  useEffect(() => {
    let clockIntervalId: NodeJS.Timeout;
    const oneSecond = Number(process.env.millisecondsInSecond);

    setTimeout(() => {
      updateClock();
      clockIntervalId = setInterval(updateClock, oneSecond);
    }, oneSecond - new Date().getMilliseconds());

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
