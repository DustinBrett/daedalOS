import { Down, Up } from "components/system/Taskbar/Calendar/Icons";
import StyledCalendar from "components/system/Taskbar/Calendar/StyledCalendar";
import type { Calendar as ICalendar } from "components/system/Taskbar/Calendar/functions";
import { createCalendar } from "components/system/Taskbar/Calendar/functions";
import useTaskbarItemTransition from "components/system/Taskbar/useTaskbarItemTransition";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "styled-components";
import Button from "styles/common/Button";
import { FOCUSABLE_ELEMENT, PREVENT_SCROLL } from "utils/constants";
import { haltEvent } from "utils/functions";
import { spotlightEffect } from "utils/spotlightEffect";

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type CalendarProps = {
  toggleCalendar: (showCalendar?: boolean) => void;
};

const Calendar: FC<CalendarProps> = ({ toggleCalendar }) => {
  const [date, setDate] = useState(() => new Date());
  const [calendar, setCalendar] = useState<ICalendar>(() =>
    createCalendar(date)
  );
  const today = useMemo(() => new Date(), []);
  const isCurrentDate = useMemo(
    () =>
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear(),
    [date, today]
  );
  const changeMonth = (direction: number): void => {
    const newDate = new Date(date);

    newDate.setMonth(newDate.getMonth() + direction);
    setDate(newDate);
    setCalendar(createCalendar(newDate));
  };
  const calendarRef = useRef<HTMLTableElement>(null);
  const {
    sizes: {
      calendar: { maxHeight },
    },
  } = useTheme();
  const calendarTransition = useTaskbarItemTransition(maxHeight, false);

  useEffect(() => {
    calendarRef.current?.addEventListener("blur", ({ relatedTarget }) => {
      if (relatedTarget instanceof HTMLElement) {
        if (calendarRef.current?.contains(relatedTarget)) {
          calendarRef.current?.focus(PREVENT_SCROLL);

          return;
        }

        const clockElement = document.querySelector("main>nav [role=timer]");

        if (
          clockElement instanceof HTMLDivElement &&
          (clockElement === relatedTarget ||
            clockElement.contains(relatedTarget))
        ) {
          return;
        }
      }

      toggleCalendar(false);
    });
    calendarRef.current?.focus(PREVENT_SCROLL);
  }, [toggleCalendar]);

  return (
    calendar && (
      <StyledCalendar
        ref={calendarRef}
        aria-label="Calendar"
        onContextMenu={haltEvent}
        {...calendarTransition}
        {...FOCUSABLE_ELEMENT}
      >
        <table>
          <thead>
            <tr>
              <td colSpan={DAY_NAMES.length}>
                <div>
                  <header>
                    {`${date.toLocaleString("default", {
                      month: "long",
                    })}, ${date.getFullYear()}`}
                  </header>
                  <nav>
                    <Button onClick={() => changeMonth(-1)}>
                      <Up />
                    </Button>
                    <Button onClick={() => changeMonth(1)}>
                      <Down />
                    </Button>
                  </nav>
                </div>
              </td>
            </tr>
            <tr>
              {DAY_NAMES.map((dayName) => (
                <td key={dayName}>{dayName}</td>
              ))}
            </tr>
          </thead>
          <tbody className={isCurrentDate ? "curr" : undefined}>
            {calendar?.map((week) => (
              <tr key={week.toString()}>
                {week.map(([day, type]) => (
                  <td
                    key={`${day}${type}`}
                    ref={(tdRef: HTMLTableCellElement) =>
                      type === "today"
                        ? undefined
                        : spotlightEffect(tdRef, false, 2)
                    }
                    className={type}
                  >
                    {day}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </StyledCalendar>
    )
  );
};

export default memo(Calendar);
