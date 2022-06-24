import type { OffscreenRenderProps } from "components/system/Desktop/Wallpapers/types";
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

const textPosition = {
  x: 0,
  y: 0,
};

const TEXT_HEIGHT_OFFSET = 1;

const drawClockText = (
  canvas: OffscreenCanvas,
  dateTime: LocaleTimeDate
): void => {
  if (!offscreenContext) {
    offscreenContext = canvas.getContext(
      "2d"
    ) as OffscreenCanvasRenderingContext2D;

    if (!offscreenContext) return;

    offscreenContext.scale(global.devicePixelRatio, global.devicePixelRatio);
    offscreenContext.fillStyle = "rgba(255, 255, 255, 90%)";
    offscreenContext.font = `12px ${formats.systemFont}`;
    offscreenContext.textAlign = "center";
    offscreenContext.textBaseline = "middle";

    textPosition.y =
      Math.floor(canvas.height / global.devicePixelRatio / 2) +
      TEXT_HEIGHT_OFFSET;
    textPosition.x = Math.floor(canvas.width / global.devicePixelRatio / 2);
  }

  offscreenContext.clearRect(0, 0, canvas.width, canvas.height);
  offscreenContext.fillText(dateTime.time, textPosition.x, textPosition.y);
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
  ({
    data,
  }: {
    data: ClockSource | OffscreenRenderProps | "init" | "tock";
  }) => {
    if (!initialized) {
      if (data === "init") {
        initialized = true;
        globalThis.postMessage("source");
      }
      return;
    }

    if (
      "OffscreenCanvas" in global &&
      (data as OffscreenRenderProps)?.canvas instanceof OffscreenCanvas
    ) {
      const { canvas, devicePixelRatio } = data as OffscreenRenderProps;

      offscreenCanvas = canvas;
      global.devicePixelRatio = devicePixelRatio;
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
