import type { DateTimeFormatParts } from '@/types/utils/dates';

const datePartsToObject = (
  acc: DateTimeFormatParts,
  { type, value }: Intl.DateTimeFormatPart
): DateTimeFormatParts => ({ ...acc, [type]: value });

const newDateTimeFormat = (
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat => new Intl.DateTimeFormat(process.env.locale, options);

export const formatToDate = (date: Date): string =>
  newDateTimeFormat({
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);

export const formatToLongDateTime = (date: Date): string => {
  const { month, day, year, hour, minute, dayPeriod } = newDateTimeFormat({
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
    .formatToParts(date)
    .reduce(datePartsToObject, {} as DateTimeFormatParts);

  return `${month} ${day}, ${year} at ${hour}:${minute} ${dayPeriod}`;
};

export const formatToShortDateTime = (date: Date): string => {
  const { year, month, day } = newDateTimeFormat({
    year: 'numeric',
    day: '2-digit',
    month: '2-digit'
  })
    .formatToParts(date)
    .reduce(datePartsToObject, {} as DateTimeFormatParts);

  return `${year}-${month}-${day}`;
};

export const formatToTime = (date: Date): string =>
  newDateTimeFormat({
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);

export const isMidnight = (time: string, hour12 = true): boolean =>
  time === (hour12 ? '12:00:00 AM' : '00:00:00');

export const newDate = (): Date => new Date();
