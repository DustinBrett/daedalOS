import styled from "styled-components";
import StyledWidget from "components/system/Desktop/Widgets/StyledWidget";

const StyledCalendarWidget = styled(StyledWidget)`
  min-width: 280px;

  .calendar-nav {
    align-items: center;
    display: flex;
    gap: 8px;
    justify-content: space-between;
    padding: 4px 14px 8px;
  }

  .calendar-month {
    font-size: 14px;
    font-weight: 500;
  }

  .calendar-nav-buttons {
    display: flex;
    gap: 4px;
  }

  .calendar-nav-buttons button {
    background: none;
    border: 0;
    border-radius: 4px;
    color: ${({ theme }) => theme.colors.text};
    cursor: pointer;
    font-size: 14px;
    height: 28px;
    line-height: 28px;
    padding: 0;
    width: 28px;

    &:hover {
      background-color: ${({ theme }) => theme.colors.taskbar.hover};
    }

    &:active {
      background-color: ${({ theme }) => theme.colors.taskbar.foreground};
    }
  }

  table {
    border-collapse: collapse;
    padding: 0 8px 10px;
    width: 100%;
  }

  th {
    color: ${({ theme }) => theme.colors.text};
    font-size: 11px;
    font-weight: 400;
    opacity: 50%;
    padding: 4px 0;
    text-align: center;
    width: 40px;
  }

  td {
    border-radius: 50%;
    font-size: 12px;
    height: 32px;
    text-align: center;
    width: 40px;

    &.prev,
    &.next {
      opacity: 30%;
    }

    &.today {
      background-color: rgb(0 120 215);
      font-weight: 600;
    }

    &:not(.today, .prev, .next):hover {
      background-color: ${({ theme }) => theme.colors.taskbar.hover};
    }
  }
`;

export default StyledCalendarWidget;
