import type { LocaleTimeDate } from "components/system/Taskbar/Clock/clockWorker";
import clockWorker from "components/system/Taskbar/Clock/clockWorker";
import StyledClock from "components/system/Taskbar/Clock/StyledClock";
import { useCallback, useState } from "react";
import useWorker from "utils/useWorker";

const Clock = (): JSX.Element => {
  const [{ date = "", time = "", dateTime = "" }, setNow] =
    useState<LocaleTimeDate>({} as LocaleTimeDate);

  useWorker<LocaleTimeDate>(
    clockWorker,
    useCallback(({ data }) => setNow(data), [])
  );

  return (
    <StyledClock dateTime={dateTime} title={date} suppressHydrationWarning>
      {time}
    </StyledClock>
  );
};

export default Clock;
