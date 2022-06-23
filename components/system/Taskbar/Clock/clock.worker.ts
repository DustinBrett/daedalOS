import { formatLocaleDateTime } from "components/system/Taskbar/Clock/functions";
import { getNtpAdjustedTime } from "components/system/Taskbar/Clock/ntp";
import type { ClockSource } from "contexts/session/types";
import { MILLISECONDS_IN_SECOND } from "utils/constants";

let mode: ClockSource;
let lastTock = 0;
let gotTock = true;

const getNow = (): Date =>
  !mode || mode === "local" ? new Date() : getNtpAdjustedTime();

const sendTick = (): void => {
  const now = getNow();

  if (lastTock) {
    gotTock = now.getTime() - lastTock < MILLISECONDS_IN_SECOND * 2;
  }

  if (gotTock) {
    globalThis.postMessage(formatLocaleDateTime(now));
  }
};

let initialized = false;

globalThis.addEventListener(
  "message",
  ({ data }: { data: ClockSource | "init" | "tock" }) => {
    if (!initialized) {
      if (data === "init") {
        initialized = true;
        globalThis.postMessage("source");
      }
      return;
    }

    if (data === "tock") {
      lastTock = getNow().getTime();
      return;
    }

    if (data === "local" || data === "ntp") mode = data;

    sendTick();
    globalThis.setTimeout(() => {
      sendTick();
      globalThis.setInterval(sendTick, MILLISECONDS_IN_SECOND);
    }, MILLISECONDS_IN_SECOND - new Date().getMilliseconds());
  },
  { passive: true }
);
