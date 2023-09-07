import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledContacts = styled.ol`
  ${ScrollBars()}
  background-color: #242526;
  height: 100%;
  overflow-y: auto;
  scrollbar-gutter: auto;

  li {
    border-radius: 10px;
    color: #fff;
    margin: 8px;
    padding: 8px;
    position: relative;

    &:hover {
      background-color: #3a3b3c;
    }

    &:focus,
    &.selected {
      background-color: rgba(45, 136, 255, 20%);
    }

    figure {
      display: flex;
      gap: 12px;
      width: calc(100% - 15px);

      img,
      svg {
        aspect-ratio: 1/1;
        border-radius: 50%;
        height: 56px;
        max-height: 56px;
        max-width: 56px;
        min-height: 56px;
        min-width: 56px;
        width: 56px;
      }

      figcaption {
        display: flex;
        flex-direction: column;
        gap: 3px;
        justify-content: center;
        overflow: hidden;
        place-items: flex-start;

        > span {
          color: #e4e6eb;
          font-size: 17px;
          font-weight: 600;
        }

        > div {
          color: #b0b3b8;
          display: flex;
          font-size: 14px;
          gap: 3px;
          width: 100%;

          div:first-child {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &.unread {
              color: #fff;
              font-weight: 600;
            }
          }

          div:last-child {
            color: #8b8d92;
            padding-right: 10px;
          }
        }
      }
    }

    &.unread::after {
      background-color: rgb(46, 137, 255);
      border-radius: 50%;
      content: "";
      height: 12px;
      position: absolute;
      right: 8px;
      top: calc(50% - 6px);
      width: 12px;
    }
  }
`;

export default StyledContacts;
