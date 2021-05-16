import { useTheme } from 'styled-components';
import { DEFAULT_LOCALE } from 'utils/constants';

type LocaleTimeDate = {
  date: string;
  dateTime: string;
  time: string;
};

const useLocaleDateTime = (now: Date): LocaleTimeDate => {
  const { formats } = useTheme();
  const formattedDate = new Intl.DateTimeFormat(
    DEFAULT_LOCALE,
    formats.date
  ).format(now);
  const day = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    weekday: 'long'
  }).format(now);
  const date = `${formattedDate}\n${day}`;
  const time = new Intl.DateTimeFormat(DEFAULT_LOCALE, formats.time).format(
    now
  );
  const dateTime = now.toISOString();

  return { date, time, dateTime };
};

export default useLocaleDateTime;
