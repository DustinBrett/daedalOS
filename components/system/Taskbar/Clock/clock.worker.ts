import { formatLocaleDateTime } from "components/system/Taskbar/Clock/functions";

const MILLISECONDS_IN_SECOND = 1000;

const sendTick = (): void =>
  globalThis.postMessage(formatLocaleDateTime(new Date()));

let initialized = false;

globalThis.addEventListener(
  "message",
  ({ data }) => {
    if (!initialized && data === "init") {
      sendTick();
      globalThis.setTimeout(() => {
        sendTick();
        globalThis.setInterval(sendTick, MILLISECONDS_IN_SECOND);
      }, MILLISECONDS_IN_SECOND - new Date().getMilliseconds());
      initialized = true;
    }
  },
  { passive: true }
);
