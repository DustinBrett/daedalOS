import styled from "styled-components";

const StyledStatusBar = styled.footer`
  background-color: rgb(25, 25, 25);
  border-top: 1px solid rgb(19, 19, 19);
  bottom: 0;
  color: rgb(108, 103, 106);
  display: flex;
  font-size: 16px;
  height: 30px;
  place-content: space-between;
  position: fixed;
  width: 100%;
  z-index: 1000;

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
      display: inline;
      margin: 0 4px;
      padding: 4px 8px;
      white-space: nowrap;

      &:hover {
        background-color: rgb(37, 37, 37);
      }

      &:active {
        background-color: rgb(34, 34, 34);
      }
    }
  }
`;

export default StyledStatusBar;
