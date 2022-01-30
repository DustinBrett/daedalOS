import type { LocaleTimeDate } from "components/system/Taskbar/Clock/clockWorker";
import clockWorker from "components/system/Taskbar/Clock/clockWorker";
import StyledClock from "components/system/Taskbar/Clock/StyledClock";
import useWorker from "hooks/useWorker";
import { useCallback, useState } from "react";

const Clock = (): JSX.Element => {
  const [{ date = "", time = "", dateTime = "" }, setNow] =
    useState<LocaleTimeDate>({} as LocaleTimeDate);

  useWorker<LocaleTimeDate>(
    clockWorker,
    "Clock",
    useCallback(({ data }: { data: LocaleTimeDate }) => setNow(data), [])
  );

  return (
    <StyledClock dateTime={dateTime} title={date} suppressHydrationWarning>
      {time}
    </StyledClock>
  );
};

export default Clock;
