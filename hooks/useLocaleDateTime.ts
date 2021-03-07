import config from 'next.config';
import { useRouter } from 'next/router';
import { useTheme } from 'styled-components';

type LocaleTimeDate = {
  date: string;
  dateTime: string;
  time: string;
};

const useLocaleDateTime = (now: Date): LocaleTimeDate => {
  const { locale = config.i18n.defaultLocale } = useRouter() || {};
  const { formats } = useTheme();
  const date = new Intl.DateTimeFormat(locale, formats.date).format(now);
  const time = new Intl.DateTimeFormat(locale, formats.time).format(now);
  const dateTime = now.toISOString();

  return { date, time, dateTime };
};

export default useLocaleDateTime;
