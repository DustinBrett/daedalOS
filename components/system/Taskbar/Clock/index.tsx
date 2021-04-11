import StyledClock from 'components/system/Taskbar/Clock/StyledClock';
import useClock from 'components/system/Taskbar/Clock/useClock';
import useLocaleDateTime from 'components/system/Taskbar/Clock/useLocaleDateTime';

const Clock = (): JSX.Element => {
  const now = useClock();
  const { date, time, dateTime } = useLocaleDateTime(now);

  return (
    <StyledClock dateTime={dateTime} title={date} suppressHydrationWarning>
      {time}
    </StyledClock>
  );
};

export default Clock;
