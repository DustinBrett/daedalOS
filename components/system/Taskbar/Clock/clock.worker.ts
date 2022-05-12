import { formatLocaleDateTime } from "components/system/Taskbar/Clock/functions";
import { getNtpAdjustedTime } from "components/system/Taskbar/Clock/ntp";
import type { ClockSource } from "contexts/session/types";
import { MILLISECONDS_IN_SECOND } from "utils/constants";

let mode: ClockSource;

const sendTick = (): void =>
  globalThis.postMessage(
    formatLocaleDateTime(
      !mode || mode === "local" ? new Date() : getNtpAdjustedTime()
    )
  );

let initialized = false;

globalThis.addEventListener(
  "message",
  ({ data }: { data: ClockSource | "init" }) => {
    if (!initialized) {
      if (data === "init") {
        initialized = true;
        globalThis.postMessage("source");
      }
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
