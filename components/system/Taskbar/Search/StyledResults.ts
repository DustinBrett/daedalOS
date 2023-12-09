import styled from "styled-components";
import { ThinScrollBars } from "components/system/Taskbar/Search/styles";
import ScrollBars from "styles/common/ScrollBars";
import { THIN_SCROLLBAR_WIDTH } from "utils/constants";

const StyledResults = styled.div`
  color: #fbf1c7;
  display: flex;
  height: calc(100% - 52px);
  width: 100%;

  .list {
    ${ScrollBars(THIN_SCROLLBAR_WIDTH, -2, -1)}
    ${ThinScrollBars}
    background-color: rgba(40, 40, 40, 95%);
    overflow-y: auto;
    scrollbar-gutter: auto;
    width: 100%;

    li {
      &.active-item {
        background-color: rgba(69, 133, 136, 75%);
      }

      position: relative;

      figure {
        display: flex;
        padding: 12px;
        padding-right: 32px;

        picture,
        img {
          height: 32px;
          width: 32px;
        }

        figcaption {
          font-size: 8px;
          margin-top: -2px;
          max-width: calc(100% - 26px);
          padding-left: 8px;

          h1 {
            font-size: 14.5px;
            font-weight: 400;
            overflow: hidden;
            padding-right: 12px;
            text-overflow: ellipsis;

            span {
              font-weight: 600;
            }
          }

          h2 {
            font-size: 13px;
            font-weight: 300;
            padding-top: 6px;
          }
        }

        &.simple {
          padding: 10px;

          picture,
          img {
            height: 16px;
            width: 16px;
          }

          figcaption {
            h1 {
              font-size: 14px;
              font-weight: 300;
              white-space: nowrap;
            }
          }
        }
      }

      div.select {
        border-left: 1px solid transparent;
        display: flex;
        height: 100%;
        place-content: center;
        place-items: center;
        position: absolute;
        right: 0;
        top: 0;
        width: 26px;

        svg {
          fill: #fbf1c7;
          height: 16px;
          width: 16px;
        }
      }

      &:hover {
        background-color: rgba(102, 92, 84, 95%);

        div.select {
          background-color: rgba(60, 56, 54, 95%);
          border-left: 1px solid rgba(40, 40, 40, 95%);
        }

        figure {
          &:not(:hover) {
            background-color: rgba(60, 56, 54, 95%);
          }
        }

        &.active-item {
          background-color: rgba(7, 102, 120, 95%);
        }
      }

      div.select:hover {
        background-color: rgba(102, 92, 84, 95%);
      }
    }
  }
`;

export default StyledResults;
