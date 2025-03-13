import { useTheme } from "styled-components";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { importCalendar } from "components/system/Taskbar/functions";
import { measureText } from "components/system/Files/FileEntry/functions";
import StyledClock from "components/system/Taskbar/Clock/StyledClock";
import { type LocaleTimeDate } from "components/system/Taskbar/Clock/functions";
import useClockContextMenu from "components/system/Taskbar/Clock/useClockContextMenu";
import { type Size } from "components/system/Window/RndWindow/useResizable";
import { useSession } from "contexts/session";
import useWorker from "hooks/useWorker";
import {
  CLOCK_CANVAS_BASE_WIDTH,
  FOCUSABLE_ELEMENT,
  ONE_TIME_PASSIVE_EVENT,
  TASKBAR_HEIGHT,
} from "utils/constants";
import { createOffscreenCanvas } from "utils/functions";
import { useMenuPreload } from "hooks/useMenuPreload";

type ClockWorkerResponse = LocaleTimeDate | "source";

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
  hasAI: boolean;
  setClockWidth: React.Dispatch<React.SetStateAction<number>>;
  toggleCalendar: () => void;
  width: number;
};

const Clock: FC<ClockProps> = ({
  hasAI,
  setClockWidth,
  toggleCalendar,
  width,
}) => {
  const [now, setNow] = useState<LocaleTimeDate>(
    Object.create(null) as LocaleTimeDate
  );
  const { date, time } = now;
  const { clockSource } = useSession();
  const clockWorkerInit = useCallback(
    () =>
      new Worker(
        new URL(
          "components/system/Taskbar/Clock/clock.worker",
          import.meta.url
        ),
        { name: "Clock" }
      ),
    // NOTE: Need `clockSource` in the dependency array to ensure the worker is rebuilt
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clockSource]
  );
  const offScreenClockCanvas = useRef<OffscreenCanvas>(undefined);
  const supportsOffscreenCanvas = useMemo(
    () => typeof window !== "undefined" && "OffscreenCanvas" in window,
    []
  );
  const updateTime = useCallback(
    ({ data, target: clockWorker }: MessageEvent<ClockWorkerResponse>) => {
      if (data === "source") {
        (clockWorker as Worker).postMessage(clockSource);
      } else {
        setNow((currentNow) =>
          !offScreenClockCanvas.current || currentNow.date !== data.date
            ? data
            : currentNow
        );
      }
    },
    [clockSource]
  );
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
  const getMeasuredWidth = useCallback(
    () =>
      Math.min(
        Math.max(
          CLOCK_CANVAS_BASE_WIDTH,
          Math.ceil(measureText(LARGEST_CLOCK_TEXT, fontSize, systemFont))
        ),
        CLOCK_CANVAS_BASE_WIDTH * 1.5
      ),
    [fontSize, systemFont]
  );
  const clockCallbackRef = useCallback(
    (clockContainer: HTMLDivElement | null) => {
      if (
        !offScreenClockCanvas.current &&
        currentWorker.current &&
        clockContainer instanceof HTMLDivElement
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
    },
    // NOTE: Need `now` in the dependency array to ensure the clock is updated
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentWorker, now]
  );
  const onClockClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      easterEggOnClick(event);
      toggleCalendar();
    },
    [toggleCalendar]
  );
  const menuPreloadHandler = useMenuPreload(importCalendar);

  useEffect(() => {
    offScreenClockCanvas.current = undefined;
    // eslint-disable-next-line react-hooks-addons/no-unused-deps
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
      ref={supportsOffscreenCanvas ? clockCallbackRef : undefined}
      $hasAI={hasAI}
      $width={width}
      aria-label="Clock"
      onClick={onClockClick}
      role="timer"
      title={date}
      suppressHydrationWarning
      {...clockContextMenu}
      {...FOCUSABLE_ELEMENT}
      {...menuPreloadHandler}
    >
      {supportsOffscreenCanvas ? undefined : time}
    </StyledClock>
  );
};

export default memo(Clock);
