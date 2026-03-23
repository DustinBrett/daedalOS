import { memo, useCallback, useMemo, useState } from "react";
import StyledCalendarWidget from "components/system/Desktop/Widgets/CalendarWidget/StyledCalendarWidget";
import {
  type Calendar,
  createCalendar,
} from "components/system/Taskbar/Calendar/functions";
import useDraggableWidget, {
  type Position,
} from "components/system/Desktop/Widgets/useDraggableWidget";

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type CalendarWidgetProps = {
  defaultPosition: Position;
};

const CalendarWidget: FC<CalendarWidgetProps> = ({ defaultPosition }) => {
  const [date, setDate] = useState(() => new Date());
  const [calendar, setCalendar] = useState<Calendar>(() =>
    createCalendar(date)
  );
  const { dragHandleProps, style } = useDraggableWidget(defaultPosition);
  const today = useMemo(() => new Date(), []);

  const isCurrentDate = useMemo(
    () =>
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear(),
    [date, today]
  );

  const changeMonth = useCallback(
    (direction: number): void => {
      const newDate = new Date(date);
      const newMonth = newDate.getMonth() + direction;

      newDate.setDate(1);
      newDate.setMonth(newMonth);

      const resolvedMonth =
        newMonth === 12 ? 0 : newMonth === -1 ? 11 : newMonth;
      const isCurrentMonth = resolvedMonth === today.getMonth();

      if (isCurrentMonth) newDate.setDate(today.getDate());

      setDate(newDate);
      setCalendar(createCalendar(newDate));
    },
    [date, today]
  );

  const monthLabel = `${date.toLocaleString("en-US", { month: "long" })}, ${date.getFullYear()}`;

  return (
    <StyledCalendarWidget data-widget="calendar" style={style}>
      <div className="widget-header" {...dragHandleProps}>
        <span style={{ fontSize: "11px", opacity: 0.6 }}>Calendar</span>
      </div>
      <div className="calendar-nav">
        <span className="calendar-month">{monthLabel}</span>
        <div className="calendar-nav-buttons">
          <button onClick={() => changeMonth(-1)} type="button">
            &#9650;
          </button>
          <button onClick={() => changeMonth(1)} type="button">
            &#9660;
          </button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            {DAY_NAMES.map((dayName) => (
              <th key={dayName}>{dayName}</th>
            ))}
          </tr>
        </thead>
        <tbody className={isCurrentDate ? "curr" : undefined}>
          {calendar.map((week) => (
            <tr key={week.toString()}>
              {week.map(([day, type]) => (
                <td key={`${day}${type}`} className={type}>
                  {day}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </StyledCalendarWidget>
  );
};

export default memo(CalendarWidget);
