import config from 'next.config';
import { useRouter } from 'next/router';
import { useTheme } from 'styled-components';

type LocaleTimeDate = {
  date: string;
  dateTime: string;
  time: string;
};

const useLocaleTimeDate = (now: Date): LocaleTimeDate => {
  const { locale = config.i18n.defaultLocale } = useRouter() || {};
  const { formats } = useTheme();

  return {
    date: new Intl.DateTimeFormat(locale, formats.date).format(now),
    time: new Intl.DateTimeFormat(locale, formats.time).format(now),
    dateTime: now.toISOString()
  };
};

export default useLocaleTimeDate;
