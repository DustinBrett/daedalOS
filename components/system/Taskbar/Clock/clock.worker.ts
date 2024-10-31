import { type OffscreenRenderProps } from "components/system/Desktop/Wallpapers/types";
import {
  type LocaleTimeDate,
  formatLocaleDateTime,
  CLOCK_TEXT_HEIGHT_OFFSET,
} from "components/system/Taskbar/Clock/functions";
import { getNtpAdjustedTime } from "components/system/Taskbar/Clock/ntp";
import { type ClockSource } from "contexts/session/types";
import formats from "styles/defaultTheme/formats";

const MILLISECONDS_IN_SECOND = 1000;

const fontSize = "12px";
const textColor = "rgba(255, 255, 255, 90%)";

let mode: ClockSource;
let offscreenCanvas: OffscreenCanvas;
let offscreenContext: OffscreenCanvasRenderingContext2D;

const getNow = (): Date =>
  !mode || mode === "local" ? new Date() : getNtpAdjustedTime();

const textPosition = {
  x: 0,
  y: 0,
};

const styleClock = (): void => {
  offscreenContext.scale(global.devicePixelRatio, global.devicePixelRatio);
  offscreenContext.fillStyle = textColor;
  offscreenContext.font = `${fontSize} ${formats.systemFont}`;
  offscreenContext.textAlign = "center";
  offscreenContext.textBaseline = "middle";

  textPosition.y =
    Math.floor(offscreenCanvas.height / global.devicePixelRatio / 2) +
    CLOCK_TEXT_HEIGHT_OFFSET;
  textPosition.x = Math.floor(
    offscreenCanvas.width / global.devicePixelRatio / 2
  );
};

const drawClockText = (dateTime: LocaleTimeDate): void => {
  if (!offscreenContext) {
    offscreenContext = offscreenCanvas.getContext(
      "2d"
    ) as OffscreenCanvasRenderingContext2D;

    if (!offscreenContext) return;

    styleClock();
  }

  offscreenContext.clearRect(
    0,
    0,
    offscreenCanvas.width,
    offscreenCanvas.height
  );
  offscreenContext.fillText(dateTime.time, textPosition.x, textPosition.y);
};

const sendTick = (): void => {
  const dateTime = formatLocaleDateTime(getNow());

  globalThis.postMessage(dateTime);
  if (offscreenCanvas) drawClockText(dateTime);
};

let initialized = false;

globalThis.addEventListener(
  "message",
  ({ data }: { data: ClockSource | OffscreenRenderProps | "init" }) => {
    if (!initialized) {
      if (data === "init") {
        initialized = true;
        globalThis.postMessage("source");
      }
      return;
    }

    if (
      "OffscreenCanvas" in global &&
      (data as OffscreenRenderProps)?.devicePixelRatio
    ) {
      const { canvas, clockSize, devicePixelRatio } =
        data as OffscreenRenderProps;

      global.devicePixelRatio = devicePixelRatio;

      if (canvas instanceof OffscreenCanvas) {
        offscreenCanvas = canvas;
      }

      if (
        offscreenCanvas instanceof OffscreenCanvas &&
        clockSize?.height &&
        clockSize?.width &&
        devicePixelRatio
      ) {
        offscreenCanvas.height = Math.floor(
          Number(clockSize.height) * devicePixelRatio
        );
        offscreenCanvas.width = Math.floor(
          Number(clockSize.width) * devicePixelRatio
        );
        styleClock();
      }

      sendTick();

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
