import useLocaleDateTime from 'hooks/useLocaleDateTime';
import useSyncedClock from 'hooks/useSyncedClock';
import { useCallback, useState } from 'react';
import StyledClock from 'styles/components/system/Taskbar/StyledClock';

const Clock = (): JSX.Element => {
  const [now, setNow] = useState(new Date());
  const { date, time, dateTime } = useLocaleDateTime(now);
  const updateClock = useCallback(() => setNow(new Date()), []);

  useSyncedClock(updateClock);

  return (
    <StyledClock dateTime={dateTime} title={date} suppressHydrationWarning>
      {time}
    </StyledClock>
  );
};

export default Clock;
