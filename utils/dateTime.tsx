type DateTimeFormatParts = {
  [key in Intl.DateTimeFormatPartTypes]: string;
};

type DateTimeOptions = Partial<Intl.DateTimeFormatOptions>;

const toShortDateTimeOptions: DateTimeOptions = {
  year: 'numeric',
  day: '2-digit',
  month: '2-digit'
};

const toDateOptions: DateTimeOptions = {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric'
};

const toTimeOptions: DateTimeOptions = {
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
};

const toLongDateTimeOptions: DateTimeOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
};

const newDateTimeFormat = (
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat => new Intl.DateTimeFormat(process.env.locale, options);

const datePartsToObject = (
  acc: DateTimeFormatParts,
  { type, value }: Intl.DateTimeFormatPart
): DateTimeFormatParts => ({ ...acc, [type]: value });

export const formatToShortDateTime = (date: Date): string => {
  const { year, month, day } = newDateTimeFormat(toShortDateTimeOptions)
    .formatToParts(date)
    .reduce(datePartsToObject, {} as DateTimeFormatParts);

  return `${year}-${month}-${day}`;
};

export const formatToLongDateTime = (date: Date): string => {
  const { month, day, year, hour, minute, dayPeriod } = newDateTimeFormat(
    toLongDateTimeOptions
  )
    .formatToParts(date)
    .reduce(datePartsToObject, {} as DateTimeFormatParts);

  return `${month} ${day}, ${year} at ${hour}:${minute} ${dayPeriod}`;
};

export const formatToDate = (date: Date): string =>
  newDateTimeFormat(toDateOptions).format(date);

export const formatToTime = (date: Date): string =>
  newDateTimeFormat(toTimeOptions).format(date);

export const isMidnight = (time: string): boolean =>
  ['00:00:00', '12:00:00 AM'].includes(time);
