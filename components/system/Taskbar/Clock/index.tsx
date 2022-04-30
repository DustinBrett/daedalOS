import type { LocaleTimeDate } from "components/system/Taskbar/Clock/functions";
import StyledClock from "components/system/Taskbar/Clock/StyledClock";
import useClockContextMenu from "components/system/Taskbar/Clock/useClockContextMenu";
import { useSession } from "contexts/session";
import useWorker from "hooks/useWorker";
import { useCallback, useState } from "react";

type ClockWorkerResponse = LocaleTimeDate | "source";

const ClockSourceMap = {
  local: "Local",
  ntp: "Server",
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
      if (data === "source") {
        (clockWorker as Worker).postMessage(clockSource);
      } else {
        setNow(data);
      }
    },
    [clockSource]
  );
  const clockContextMenu = useClockContextMenu();

  useWorker<ClockWorkerResponse>(clockWorkerInit, updateTime);

  if (!time) return <></>;

  return (
    <StyledClock
      aria-label="Clock"
      dateTime={dateTime}
      title={date}
      suppressHydrationWarning
      {...clockContextMenu}
    >
      {time}
    </StyledClock>
  );
};

export default Clock;
