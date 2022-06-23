import type { LocaleTimeDate } from "components/system/Taskbar/Clock/functions";
import { formatLocaleDateTime } from "components/system/Taskbar/Clock/functions";
import { getNtpAdjustedTime } from "components/system/Taskbar/Clock/ntp";
import type { ClockSource } from "contexts/session/types";
import formats from "styles/defaultTheme/formats";
import { MILLISECONDS_IN_SECOND } from "utils/constants";

let mode: ClockSource;
let offscreenCanvas: OffscreenCanvas;
let offscreenContext: OffscreenCanvasRenderingContext2D;
let lastTock = 0;
let gotTock = true;

const getNow = (): Date =>
  !mode || mode === "local" ? new Date() : getNtpAdjustedTime();

const drawClockText = (
  canvas: OffscreenCanvas,
  dateTime: LocaleTimeDate
): void => {
  if (!offscreenContext) {
    offscreenContext = canvas.getContext(
      "2d"
    ) as OffscreenCanvasRenderingContext2D;

    if (!offscreenContext) return;

    offscreenContext.fillStyle = "rgba(255, 255, 255, 90%)";
    offscreenContext.textAlign = "center";
    offscreenContext.textBaseline = "middle";
    offscreenContext.font = `12px ${formats.systemFont}`;
  }

  offscreenContext.clearRect(0, 0, canvas.width, canvas.height);
  offscreenContext.fillText(
    dateTime.time,
    canvas.width / 2,
    canvas.height / 2 + 2
  );
};

const sendTick = (): void => {
  const now = getNow();

  if (lastTock) {
    gotTock = now.getTime() - lastTock < MILLISECONDS_IN_SECOND * 2;
  }

  const dateTime = formatLocaleDateTime(now);

  if (gotTock) {
    globalThis.postMessage(dateTime);
  }

  if (offscreenCanvas) {
    drawClockText(offscreenCanvas, dateTime);
  }
};

let initialized = false;

globalThis.addEventListener(
  "message",
  ({ data }: { data: ClockSource | OffscreenCanvas | "init" | "tock" }) => {
    if (!initialized) {
      if (data === "init") {
        initialized = true;
        globalThis.postMessage("source");
      }
      return;
    }

    if ("OffscreenCanvas" in global && data instanceof OffscreenCanvas) {
      offscreenCanvas = data;
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
