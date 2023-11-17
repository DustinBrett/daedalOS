import styled from "styled-components";

const StyledStatusBar = styled.footer`
  background-color: rgb(29, 32, 33);
  border-top: 1px solid rgb(19, 19, 19);
  bottom: 0;
  color: rgb(102, 92, 84);
  display: flex;
  font-size: 16px;
  height: 30px;
  place-content: space-between;
  position: fixed;
  width: 100%;
  z-index: 1;

  ol {
    display: flex;
    place-content: flex-end;
    place-items: center;

    &:first-of-type {
      padding-left: 8px;
    }

    &:last-of-type {
      padding-right: 8px;
    }

    li {
      margin: 0 4px;
      padding: 4px 8px;
      white-space: nowrap;

      button {
        color: inherit;
        font-size: inherit;
        padding: 4px 8px;

        &.pretty {
          position: relative;
          top: -2px;
        }

        svg {
          fill: rgb(102, 92, 84);
          height: 16px;
          width: 16px;
        }
      }

      &:hover {
        background-color: rgb(40, 40, 40);
      }

      &:active {
        background-color: rgb(29, 32, 33);
      }

      &.clickable {
        padding: 0;
      }

      &.save {
        svg {
          margin-top: 4px;
        }
      }
    }
  }
`;

export default StyledStatusBar;
