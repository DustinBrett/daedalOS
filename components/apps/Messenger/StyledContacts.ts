import { m as motion } from "motion/react";
import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledContacts = styled(motion.ol)`
  ${ScrollBars()}
  background-color: #242526;
  height: 100%;
  overflow-y: auto;
  position: absolute;
  scrollbar-gutter: auto;
  top: 0;
  width: 100%;

  li {
    align-items: center;
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    display: flex;
    margin: 8px;
    padding: 8px;
    position: relative;

    button {
      cursor: pointer;
    }

    input[type="checkbox"] {
      accent-color: #2d88ff;
      cursor: pointer;
      height: 16px;
      margin: 0 10px 0 2px;
      min-width: 16px;
    }

    &.toolbar {
      cursor: default;
      gap: 4px;
      margin-bottom: 0;
      padding: 0 8px;

      &:hover {
        background-color: transparent;
      }

      h2,
      label {
        color: #e4e6eb;
        flex: 1;
        font-size: 15px;
        font-weight: 600;
        white-space: nowrap;
      }

      label {
        align-items: center;
        cursor: pointer;
        display: flex;
        font-size: 13px;
      }

      button {
        border-radius: 6px;
        color: #2d88ff;
        font-size: 13px;
        font-weight: 600;
        padding: 4px 6px;
        width: auto;

        &:hover:not(:disabled) {
          background-color: #3a3b3c;
        }

        &:disabled {
          cursor: default;
          opacity: 40%;
        }
      }
    }

    &:hover {
      background-color: #3a3b3c;
    }

    &:focus,
    &.selected {
      background-color: rgb(45 136 255 / 20%);
    }

    figure {
      cursor: pointer;
      display: flex;
      gap: 12px;
      width: calc(100% - 15px);

      div {
        cursor: pointer;
      }

      img,
      svg {
        aspect-ratio: 1/1;
        border-radius: 50%;
        cursor: pointer;
        height: 56px;
        max-height: 56px;
        max-width: 56px;
        min-height: 56px;
        min-width: 56px;
        pointer-events: none;
        width: 56px;
      }

      figcaption {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 3px;
        justify-content: center;
        overflow: hidden;
        place-items: flex-start;

        > span {
          color: #e4e6eb;
          cursor: pointer;
          font-size: 17px;
          font-weight: 600;
        }

        > div {
          color: #b0b3b8;
          cursor: pointer;
          display: flex;
          font-size: 14px;
          gap: 3px;
          width: 100%;

          div:first-child {
            cursor: pointer;
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
            cursor: pointer;
            padding-right: 10px;
          }
        }
      }
    }

    &.unread::after {
      background-color: rgb(46 137 255);
      border-radius: 50%;
      content: "";
      cursor: pointer;
      height: 10px;
      pointer-events: none;
      position: absolute;
      right: 8px;
      top: calc(50% - 5px);
      width: 10px;
    }
  }
`;

export default StyledContacts;
