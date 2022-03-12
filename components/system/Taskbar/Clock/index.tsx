import type { LocaleTimeDate } from "components/system/Taskbar/Clock/functions";
import StyledClock from "components/system/Taskbar/Clock/StyledClock";
import useWorker from "hooks/useWorker";
import { useCallback, useState } from "react";

const Clock = (): JSX.Element => {
  const [{ date, time, dateTime }, setNow] = useState<LocaleTimeDate>(
    {} as LocaleTimeDate
  );
  const clockWorkerInit = useCallback(
    () =>
      new Worker(
        new URL(
          "components/system/Taskbar/Clock/clock.worker",
          import.meta.url
        ),
        { name: "Clock" }
      ),
    []
  );
  const updateTime = useCallback(
    ({ data }: { data: LocaleTimeDate }) => setNow(data),
    []
  );

  useWorker<LocaleTimeDate>(clockWorkerInit, updateTime);

  if (!time) return <></>;

  return (
    <StyledClock
      aria-label="Clock"
      dateTime={dateTime}
      title={date}
      suppressHydrationWarning
    >
      {time}
    </StyledClock>
  );
};

export default Clock;
