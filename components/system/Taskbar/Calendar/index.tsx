import { useTheme } from "styled-components";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Down, Up } from "components/system/Taskbar/Calendar/Icons";
import StyledCalendar from "components/system/Taskbar/Calendar/StyledCalendar";
import {
  CELEBRATIONS,
  type Calendar as ICalendar,
  celebrate,
  createCalendar,
} from "components/system/Taskbar/Calendar/functions";
import useTaskbarItemTransition from "components/system/Taskbar/useTaskbarItemTransition";
import Button from "styles/common/Button";
import { FOCUSABLE_ELEMENT, PREVENT_SCROLL } from "utils/constants";
import { haltEvent, hasFinePointer } from "utils/functions";
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
  const changeMonth = useCallback(
    (direction: number): void => {
      const newDate = new Date(date);
      const newMonth = newDate.getMonth() + direction;

      newDate.setDate(1);
      newDate.setMonth(newMonth);

      const isCurrentMonth =
        (newMonth === 12 ? 0 : newMonth === -1 ? 11 : newMonth) ===
        today.getMonth();

      if (isCurrentMonth) newDate.setDate(today.getDate());

      setDate(newDate);
      setCalendar(createCalendar(newDate));
    },
    [date, today]
  );
  const calendarRef = useRef<HTMLTableElement>(null);
  const {
    sizes: {
      calendar: { maxHeight },
    },
  } = useTheme();
  const calendarTransition = useTaskbarItemTransition(maxHeight, false);
  const finePointer = useMemo(() => hasFinePointer(), []);

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
                    ref={(tdRef: HTMLTableCellElement) => {
                      if (finePointer && type !== "today") {
                        spotlightEffect(tdRef, true, 2, true);
                      }
                    }}
                    className={type}
                    onClick={(event) => {
                      if (CELEBRATIONS[date.getMonth() + 1]?.[day]) {
                        celebrate(event.clientX + 23, event.clientY + 20);
                      }
                    }}
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
