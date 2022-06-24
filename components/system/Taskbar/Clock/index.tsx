import type { LocaleTimeDate } from "components/system/Taskbar/Clock/functions";
import StyledClock from "components/system/Taskbar/Clock/StyledClock";
import useClockContextMenu from "components/system/Taskbar/Clock/useClockContextMenu";
import { useSession } from "contexts/session";
import useWorker from "hooks/useWorker";
import { useCallback, useEffect, useRef, useState } from "react";
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
    const { default: spawnSheep } = await import("utils/eSheep");

    spawnSheep();
    triggerEasterEggCountdown = EASTER_EGG_CLICK_COUNT;
  }
};

const Clock: FC = () => {
  const [now, setNow] = useState<LocaleTimeDate>({} as LocaleTimeDate);
  const { date, time, dateTime } = now;
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
  const updateTime = useCallback(
    ({ data, target: clockWorker }: MessageEvent<ClockWorkerResponse>) => {
      const sendSource = data === "source";

      if (!sendSource) setNow(data);

      (clockWorker as Worker).postMessage(sendSource ? clockSource : "tock");
    },
    [clockSource]
  );
  const clockContextMenu = useClockContextMenu();
  const currentWorker = useWorker<ClockWorkerResponse>(
    clockWorkerInit,
    updateTime
  );
  const offScreenClockCanvas = useRef<OffscreenCanvas>();
  const supportsOffscreenCanvas =
    typeof window !== "undefined" && "OffscreenCanvas" in window;

  useEffect(() => {
    offScreenClockCanvas.current = undefined;
  }, [clockSource]);

  if (!time) return <></>;

  return (
    <StyledClock
      ref={(clockContainer) => {
        if (
          supportsOffscreenCanvas &&
          !offScreenClockCanvas.current &&
          currentWorker.current &&
          clockContainer instanceof HTMLTimeElement
        ) {
          [...clockContainer.children].forEach((element) => element.remove());

          offScreenClockCanvas.current = createOffscreenCanvas(clockContainer);
          offScreenClockCanvas.current.height = TASKBAR_HEIGHT;
          offScreenClockCanvas.current.width = BASE_CLOCK_WIDTH;

          currentWorker.current.postMessage(offScreenClockCanvas.current, [
            offScreenClockCanvas.current,
          ]);
        }
      }}
      aria-label="Clock"
      dateTime={dateTime}
      onClick={easterEggOnClick}
      title={date}
      suppressHydrationWarning
      {...clockContextMenu}
    >
      {!supportsOffscreenCanvas ? time : undefined}
    </StyledClock>
  );
};

export default Clock;
