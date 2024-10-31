export type LocaleTimeDate = {
  date: string;
  time: string;
};

const DEFAULT_LOCALE = "en";

const dateFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  hour: "numeric",
  hour12: true,
  minute: "2-digit",
  second: "2-digit",
});

const dayFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  weekday: "long",
});

export const formatLocaleDateTime = (now: Date): LocaleTimeDate => {
  const date = dateFormatter.format(now);
  const day = dayFormatter.format(now);
  const time = timeFormatter.format(now);

  return {
    date: `${date}\n${day}`,
    time,
  };
};

export const CLOCK_TEXT_HEIGHT_OFFSET = 1;
