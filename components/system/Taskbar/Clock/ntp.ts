type NTPResponse = {
  backoff: number;
  now: number;
  optout?: boolean;
};

const DEFAULT_BACKOFF_SECONDS = 300;
const MILLISECONDS_IN_SECOND = 1000;
const HOUR_IN_SECONDS = 3600;
const NTP_SERVER = "https://use.ntpjs.org/v1/time.json";

const NtpReqOptions = {
  cache: "no-cache",
  credentials: "omit",
  keepalive: false,
  mode: "cors",
  priority: "high",
  referrerPolicy: "no-referrer",
  // eslint-disable-next-line unicorn/no-null
  window: null,
} as RequestInit;

const getNtpResponse = async (): Promise<NTPResponse> => {
  const ntpResponse = await fetch(NTP_SERVER, NtpReqOptions);
  const ntpJsonResponse = (await ntpResponse.json()) as NTPResponse;

  return ntpJsonResponse || {};
};

let msAheadBy: number;

const pollNtpTime = async (): Promise<void> => {
  const requestStartTime = Date.now();
  const {
    backoff = DEFAULT_BACKOFF_SECONDS,
    now = 0,
    optout = false,
  } = await getNtpResponse();

  if (now) {
    msAheadBy = requestStartTime - Math.ceil(now * MILLISECONDS_IN_SECOND);
  }

  setTimeout(
    pollNtpTime,
    (optout ? HOUR_IN_SECONDS : backoff) * MILLISECONDS_IN_SECOND
  );
};

export const getNtpAdjustedTime = (): Date => {
  if (typeof msAheadBy !== "number") {
    msAheadBy = 0;
    pollNtpTime();
  }

  return new Date(Date.now() - msAheadBy);
};
