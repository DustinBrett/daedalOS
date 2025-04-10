import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";
import { DEFAULT_SCROLLBAR_WIDTH } from "utils/constants";

const StyledDetailsTab = styled.div`
  background-color: #fff;
  border: 1px solid rgb(217 217 217);
  height: calc(100% - 64px);
  padding: 12px 13px;
  position: relative;
  top: -1px;

  table {
    ${ScrollBars(DEFAULT_SCROLLBAR_WIDTH, 0, 0, "light")};
    border: 1px solid rgb(130 135 144);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: scroll;
    text-align: left;

    thead {
      background-color: #fff;
      display: flex;
      height: 24px;
      padding: 8px 5px;
      place-items: center;
      position: sticky;
      top: 0;
      z-index: 2;

      th {
        border-right: 1px solid #e0e0e0;
        font-size: 12px;
        font-weight: 400;
        padding-left: 4px;

        &.property {
          padding-left: 0;
          width: 123px;
        }

        &.value {
          border-right: none;
        }
      }
    }

    tbody {
      font-size: 12px;
      padding-bottom: 8px;

      tr {
        display: block;
        padding: 0 5px;

        th {
          font-weight: 400;
          max-width: 127px;
          overflow: hidden;
          padding-right: 4px;
          text-overflow: ellipsis;
          vertical-align: top;
          white-space: nowrap;
          width: 127px;
        }

        td {
          cursor: text;
          max-width: 157px;
          overflow: hidden;
          text-overflow: ellipsis;
          user-select: text;

          img {
            width: 100%;
          }
        }

        &.header {
          color: rgb(0 45 135);
          display: inline-table;
          margin-top: 4px;
          padding-left: 12px;
          padding-right: 10px;

          &:hover {
            background-color: rgb(0 140 255 / 10%);
          }

          &:first-child {
            margin-top: 0;
          }

          .line {
            position: relative;
            width: 100%;

            &::before {
              background-color: rgb(178 193 224);
              content: "";
              display: block;
              height: 1px;
              left: 0;
              position: absolute;
              top: 8px;
              width: 100%;
            }
          }
        }
      }
    }
  }
`;

export default StyledDetailsTab;
