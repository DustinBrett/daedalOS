import type { LocaleTimeDate } from "components/system/Taskbar/Clock/functions";
import StyledClock from "components/system/Taskbar/Clock/StyledClock";
import useClockContextMenu from "components/system/Taskbar/Clock/useClockContextMenu";
import type { Size } from "components/system/Window/RndWindow/useResizable";
import { useSession } from "contexts/session";
import useWorker from "hooks/useWorker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BASE_CLOCK_WIDTH,
  ONE_TIME_PASSIVE_EVENT,
  TASKBAR_HEIGHT,
} from "utils/constants";
import { createOffscreenCanvas } from "utils/functions";

type ClockWorkerResponse = LocaleTimeDate | "source";

const ClockSourceMap = {
  local: "Local",
  ntp: "Server",
};

const EASTER_EGG_CLICK_COUNT = 7;

const clockSize: Size = {
  height: TASKBAR_HEIGHT,
  width: BASE_CLOCK_WIDTH,
};

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
    target.setAttribute("tabIndex", "-1");

    ["blur", "mouseleave"].forEach((type) => {
      target.removeEventListener(type, resetEasterEggCountdown);
      target.addEventListener(
        type,
        resetEasterEggCountdown,
        ONE_TIME_PASSIVE_EVENT
      );
    });
  }

  triggerEasterEggCountdown -= 1;

  if (triggerEasterEggCountdown === 0) {
    const { default: spawnSheep } = await import("utils/spawnSheep");

    spawnSheep();
    triggerEasterEggCountdown = EASTER_EGG_CLICK_COUNT;
  }
};

const Clock: FC = () => {
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
        { name: `Clock (${ClockSourceMap[clockSource]})` }
      ),
    [clockSource]
  );
  const offScreenClockCanvas = useRef<OffscreenCanvas>();
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
  const clockContextMenu = useClockContextMenu();
  const currentWorker = useWorker<ClockWorkerResponse>(
    clockWorkerInit,
    updateTime
  );
  const clockCallbackRef = useCallback(
    (clockContainer: HTMLDivElement | null) => {
      if (
        !offScreenClockCanvas.current &&
        currentWorker.current &&
        clockContainer instanceof HTMLDivElement
      ) {
        [...clockContainer.children].forEach((element) => element.remove());

        offScreenClockCanvas.current = createOffscreenCanvas(
          clockContainer,
          window.devicePixelRatio,
          clockSize
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

  useEffect(() => {
    offScreenClockCanvas.current = undefined;
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
                clockSize,
                devicePixelRatio: window.devicePixelRatio,
              });
              monitorPixelRatio();
            },
            ONE_TIME_PASSIVE_EVENT
          );

      monitorPixelRatio();
    }
  }, [currentWorker, supportsOffscreenCanvas]);

  // eslint-disable-next-line unicorn/no-null
  if (!time) return null;

  return (
    <StyledClock
      ref={supportsOffscreenCanvas ? clockCallbackRef : undefined}
      aria-label="Clock"
      onClick={easterEggOnClick}
      title={date}
      suppressHydrationWarning
      {...clockContextMenu}
    >
      {supportsOffscreenCanvas ? undefined : time}
    </StyledClock>
  );
};

export default Clock;
