import { m as motion } from "framer-motion";
import styled from "styled-components";
import { TASKBAR_HEIGHT } from "utils/constants";

const StyledCalendar = styled(motion.section)`
  backdrop-filter: ${({ theme }) => `blur(${theme.sizes.taskbar.blur})`};
  background-color: ${({ theme }) => theme.colors.taskbar.background};
  border: ${({ theme }) => `1px solid ${theme.colors.taskbar.peekBorder}`};
  border-bottom: 0;
  border-right: 0;
  bottom: ${TASKBAR_HEIGHT}px;
  position: absolute;
  right: 0;
  z-index: 10000;

  table {
    padding: 4px 10px 19px;
    white-space: nowrap;

    td {
      color: #fbf1c7;
      display: inline-table;
      height: 40px;
      line-height: 32px;
      margin: 0 1px;
      text-align: center;
      width: 46px;

      &.prev,
      &.next {
        color: rgb(124, 111, 100);
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
            color: rgb(235, 219, 178);

            &:hover {
              color: #fbf1c7;
            }

            &:active {
              color: rgb(168, 153, 132);
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
          fill: rgb(235, 219, 178);

          &:hover {
            fill: #fbf1c7;
          }

          &:active {
            fill: rgb(168, 153, 132);
          }

          svg {
            width: 16px;
          }
        }
      }
    }

    tbody.curr td.today {
      background-color: rgb(69, 133, 136);
      color: #fbf1c7;
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
        border: 2px solid #282828;
        inset: 2px;
      }

      &:hover {
        &::after {
          border: 2px solid rgb(131, 165, 152);
        }
      }

      &:active {
        &::after {
          border: 2px solid rgb(142, 192, 124);
        }
      }
    }
  }
`;

export default StyledCalendar;
