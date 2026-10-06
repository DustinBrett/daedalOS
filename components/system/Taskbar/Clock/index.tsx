import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";
import { measureText } from "components/system/Files/FileEntry/functions";
import { type LocaleTimeDate } from "components/system/Taskbar/Clock/functions";
import StyledClock from "components/system/Taskbar/Clock/StyledClock";
import useClockContextMenu from "components/system/Taskbar/Clock/useClockContextMenu";
import { importCalendar } from "components/system/Taskbar/functions";
import { type Size } from "components/system/Window/RndWindow/useResizable";
import { useClockSource } from "contexts/session";
import { useMenuPreload } from "hooks/useMenuPreload";
import useWorker from "hooks/useWorker";
import {
  CLICK_FOCUSABLE_ELEMENT,
  CLOCK_CANVAS_BASE_WIDTH,
  ONE_TIME_PASSIVE_EVENT,
  TASKBAR_HEIGHT,
} from "utils/constants";
import {
  createOffscreenCanvas,
  hasOffscreenCanvasSupport,
} from "utils/functions";

type ClockWorkerResponse = "source" | LocaleTimeDate;

const EASTER_EGG_CLICK_COUNT = 7;

const LARGEST_CLOCK_TEXT = "44:44:44 AM";

let triggerEasterEggCountdown = EASTER_EGG_CLICK_COUNT;

const resetEasterEggCountdown = (): void => {
  triggerEasterEggCountdown = EASTER_EGG_CLICK_COUNT;
};

const easterEggOnClick: React.MouseEventHandler<HTMLElement> = async ({
  target,
}): Promise<void> => {
  if (
    triggerEasterEggCountdown === EASTER_EGG_CLICK_COUNT &&
    target instanceof HTMLElement
  ) {
    target.removeEventListener("mouseleave", resetEasterEggCountdown);
    target.addEventListener(
      "mouseleave",
      resetEasterEggCountdown,
      ONE_TIME_PASSIVE_EVENT
    );
  }

  triggerEasterEggCountdown -= 1;

  if (triggerEasterEggCountdown === 0) {
    const { spawnSheep } = await import("utils/spawnSheep");

    spawnSheep();

    triggerEasterEggCountdown = EASTER_EGG_CLICK_COUNT;
  }
};

type ClockProps = {
  calendarVisible: boolean;
  hasAI: boolean;
  setClockWidth: React.Dispatch<React.SetStateAction<number>>;
  toggleCalendar: () => void;
  width: number;
};

// The worker is rebuilt on clock source changes via useWorker's onMessage dep
const clockWorkerInit = (): Worker =>
  new Worker(
    new URL("components/system/Taskbar/Clock/clock.worker", import.meta.url),
    { name: "Clock" }
  );

const Clock: FC<ClockProps> = ({
  calendarVisible,
  hasAI,
  setClockWidth,
  toggleCalendar,
  width,
}) => {
  const [now, setNow] = useState<LocaleTimeDate>(
    Object.create(null) as LocaleTimeDate
  );
  const { date, time } = now;
  const clockSource = useClockSource();
  const offScreenClockCanvas = useRef<OffscreenCanvas>(undefined);
  const clockButtonRef = useRef<HTMLButtonElement | null>(null);
  const supportsOffscreenCanvas = hasOffscreenCanvasSupport();
  const updateTime = ({
    data,
    target: clockWorker,
  }: MessageEvent<ClockWorkerResponse>): void => {
    if (data === "source") {
      (clockWorker as Worker).postMessage(clockSource);
    } else {
      // The offscreen canvas path skips re-rendering on time changes, so
      // the accessible name must be kept current imperatively
      clockButtonRef.current?.setAttribute(
        "aria-label",
        `System Clock, ${data.time}`
      );
      setNow((currentNow) =>
        !offScreenClockCanvas.current || currentNow.date !== data.date
          ? data
          : currentNow
      );
    }
  };
  const clockContextMenu = useClockContextMenu(toggleCalendar);
  const currentWorker = useWorker<ClockWorkerResponse>(
    clockWorkerInit,
    updateTime
  );
  const clockSize = useRef<Size>({
    height: TASKBAR_HEIGHT,
    width,
  });
  const {
    formats: { systemFont },
    sizes: {
      clock: { fontSize },
    },
  } = useTheme();
  const getMeasuredWidth = (): number =>
    Math.min(
      Math.max(
        CLOCK_CANVAS_BASE_WIDTH,
        Math.ceil(measureText(LARGEST_CLOCK_TEXT, fontSize, systemFont))
      ),
      CLOCK_CANVAS_BASE_WIDTH * 1.5
    );
  const onClockClick = (event: React.MouseEvent<HTMLElement>): void => {
    easterEggOnClick(event);
    toggleCalendar();
  };
  const menuPreloadHandler = useMenuPreload(importCalendar);

  // Runs on each tick so the canvas is recreated after a clock source change
  useLayoutEffect(() => {
    const clockContainer = clockButtonRef.current;

    if (
      !offScreenClockCanvas.current &&
      currentWorker.current &&
      clockContainer instanceof HTMLButtonElement
    ) {
      [...clockContainer.children].forEach((element) => element.remove());

      clockSize.current.width = getMeasuredWidth();
      setClockWidth(clockSize.current.width);

      offScreenClockCanvas.current = createOffscreenCanvas(
        clockContainer,
        window.devicePixelRatio,
        clockSize.current
      );

      currentWorker.current.postMessage(
        {
          canvas: offScreenClockCanvas.current,
          devicePixelRatio: window.devicePixelRatio,
        },
        [offScreenClockCanvas.current]
      );
    }
    // eslint-disable-next-line react/exhaustive-effect-dependencies
  }, [currentWorker, getMeasuredWidth, now, setClockWidth]);

  useEffect(() => {
    offScreenClockCanvas.current = undefined;
    // eslint-disable-next-line react/exhaustive-effect-dependencies
  }, [clockSource]);

  useEffect(() => {
    if (supportsOffscreenCanvas) {
      const monitorPixelRatio = (): void =>
        window
          .matchMedia(`(resolution: ${window.devicePixelRatio}x)`)
          .addEventListener(
            "change",
            () => {
              currentWorker.current?.postMessage({
                clockSize: clockSize.current,
                devicePixelRatio: window.devicePixelRatio,
              });
              monitorPixelRatio();
            },
            ONE_TIME_PASSIVE_EVENT
          );

      monitorPixelRatio();
    } else setClockWidth(getMeasuredWidth());
  }, [currentWorker, getMeasuredWidth, setClockWidth, supportsOffscreenCanvas]);

  // eslint-disable-next-line unicorn/no-null
  if (!time) return null;

  return (
    <StyledClock
      ref={supportsOffscreenCanvas ? clockButtonRef : undefined}
      $hasAI={hasAI}
      $width={width}
      aria-expanded={calendarVisible}
      aria-haspopup="dialog"
      aria-label={`System Clock, ${time}`}
      id="clock"
      {...(calendarVisible && { "aria-controls": "calendar" })}
      onClick={onClockClick}
      {...CLICK_FOCUSABLE_ELEMENT}
      title={date}
      suppressHydrationWarning
      {...clockContextMenu}
      {...menuPreloadHandler}
    >
      {supportsOffscreenCanvas ? undefined : time}
    </StyledClock>
  );
};

export default Clock;
