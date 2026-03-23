import { memo, useCallback, useEffect, useState } from "react";
import StyledClockWidget from "components/system/Desktop/Widgets/ClockWidget/StyledClockWidget";
import useDraggableWidget, {
  type Position,
} from "components/system/Desktop/Widgets/useDraggableWidget";
import { MILLISECONDS_IN_SECOND } from "utils/constants";

const DEFAULT_LOCALE = "en";

const timeFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  hour: "numeric",
  hour12: true,
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  day: "numeric",
  month: "long",
  weekday: "long",
  year: "numeric",
});

type ClockWidgetProps = {
  defaultPosition: Position;
};

const formatTime = (now: Date): string => timeFormatter.format(now);
const formatDate = (now: Date): string => dateFormatter.format(now);

const ClockWidget: FC<ClockWidgetProps> = ({ defaultPosition }) => {
  const [now, setNow] = useState(() => new Date());
  const { dragHandleProps, style } = useDraggableWidget(defaultPosition);

  const tick = useCallback((): void => {
    setNow(new Date());
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      tick();
      const interval = setInterval(tick, MILLISECONDS_IN_SECOND);

      return (): void => clearInterval(interval);
    }, MILLISECONDS_IN_SECOND - now.getMilliseconds());

    return (): void => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return (
    <StyledClockWidget data-widget="clock" style={style}>
      <div className="widget-header" {...dragHandleProps}>
        <span style={{ fontSize: "11px", opacity: 0.6 }}>Clock</span>
      </div>
      <div className="clock-time">{formatTime(now)}</div>
      <div className="clock-date">{formatDate(now)}</div>
    </StyledClockWidget>
  );
};

export default memo(ClockWidget);
