import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledContacts = styled.ol`
  ${ScrollBars()}
  background-color: #242526;
  height: 100%;
  overflow-y: auto;

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

      img {
        border-radius: 50%;
        width: 56px;
      }

      figcaption {
        display: flex;
        flex-direction: column;
        gap: 3px;
        justify-content: center;
        overflow: hidden;

        > span {
          color: #e4e6eb;
          font-size: 17px;
          font-weight: 500;
        }

        > div {
          color: #b0b3b8;
          display: flex;
          font-size: 14px;
          gap: 3px;

          div:first-child {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          div:last-child {
            color: #8b8d92;
            padding-right: 10px;
          }
        }
      }
    }
  }
`;

export default StyledContacts;
