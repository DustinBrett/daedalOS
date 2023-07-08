import styled from "styled-components";
import { TASKBAR_HEIGHT } from "utils/constants";

const StyledCalendar = styled.section`
  backdrop-filter: ${({ theme }) => `blur(${theme.sizes.taskbar.blur})`};
  background-color: ${({ theme }) => theme.colors.taskbar.background};
  border: ${({ theme }) => `1px solid ${theme.colors.taskbar.peekBorder}`};
  border-bottom: 0;
  border-right: 0;
  position: absolute;
  bottom: ${TASKBAR_HEIGHT}px;
  right: 0;

  table {
    padding: 4px 10px 19px;

    td {
      display: inline-table;
      text-align: center;
      width: 46px;
      height: 40px;
      line-height: 32px;
      margin: 0 1px;
      color: #fff;

      &.prev,
      &.next {
        color: rgb(125, 125, 125);
      }
    }

    thead {
      font-size: 12px;

      td[colspan] {
        display: table-cell;
        padding: 0;

        div {
          display: flex;
          font-size: 15px;
          padding: 0 16px 0 12px;
          place-content: space-between;

          header {
            color: rgb(223, 223, 223);

            &:hover {
              color: #fff;
            }

            &:active {
              color: rgb(165, 156, 156);
            }
          }
        }
      }

      td:not([colspan]) {
        height: auto;
        margin-top: -1px;
      }

      nav {
        display: flex;
        flex-direction: row;
        gap: 32px;
        padding-top: 2px;

        button {
          fill: rgb(223, 223, 223);

          &:hover {
            fill: #fff;
          }

          &:active {
            fill: rgb(165, 156, 156);
          }

          svg {
            width: 16px;
          }
        }
      }
    }

    tbody.curr td.today {
      background-color: rgb(0, 120, 215);
      color: #fff;
      position: relative;

      &::after,
      &::before {
        content: "";
        position: absolute;
      }

      &::after {
        inset: 0;
      }

      &::before {
        inset: 2px;
        border: 2px solid #000;
      }

      &:hover {
        &::after {
          border: 2px solid rgb(102, 174, 231);
        }
      }

      &:active {
        &::after {
          border: 2px solid rgb(153, 201, 239);
        }
      }
    }
  }
`;

export default StyledCalendar;
