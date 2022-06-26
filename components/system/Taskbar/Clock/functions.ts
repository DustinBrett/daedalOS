export type LocaleTimeDate = {
  date: string;
  time: string;
};

const DEFAULT_LOCALE = "en";

const dateFormat: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

const timeFormat: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  hour12: true,
  minute: "2-digit",
  second: "2-digit",
};

const dayFormat: Intl.DateTimeFormatOptions = {
  weekday: "long",
};

export const formatLocaleDateTime = (now: Date): LocaleTimeDate => {
  const date = new Intl.DateTimeFormat(DEFAULT_LOCALE, dateFormat).format(now);
  const day = new Intl.DateTimeFormat(DEFAULT_LOCALE, dayFormat).format(now);
  const time = new Intl.DateTimeFormat(DEFAULT_LOCALE, timeFormat).format(now);

  return {
    date: `${date}\n${day}`,
    time,
  };
};
