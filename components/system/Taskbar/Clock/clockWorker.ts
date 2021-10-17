export type LocaleTimeDate = {
  date: string;
  dateTime: string;
  time: string;
};

const clockWorker = (): void => {
  const locale = "en";
  const secondsInMilliseconds = 1000;
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
  const formatLocaleDateTime = (now: Date): LocaleTimeDate => {
    const date = new Intl.DateTimeFormat(locale, dateFormat).format(now);
    const day = new Intl.DateTimeFormat(locale, dayFormat).format(now);
    const time = new Intl.DateTimeFormat(locale, timeFormat).format(now);

    return {
      date: `${date}\n${day}`,
      dateTime: now.toISOString(),
      time,
    };
  };
  const sendTick = (): void => postMessage(formatLocaleDateTime(new Date()));
  let initialized = false;

  globalThis.addEventListener(
    "message",
    ({ data }) => {
      if (!initialized && data === "init") {
        sendTick();
        setTimeout(() => {
          sendTick();
          setInterval(sendTick, secondsInMilliseconds);
        }, secondsInMilliseconds - new Date().getMilliseconds());
        initialized = true;
      }
    },
    { passive: true }
  );
};

export default clockWorker;
