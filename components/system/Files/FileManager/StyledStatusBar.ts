import styled from "styled-components";

const StyledStatusBar = styled.footer`
  align-items: center;
  background-color: rgb(51 51 51);
  bottom: 0;
  color: rgb(247 247 247);
  display: flex;
  font-size: 12px;
  font-weight: 200;
  height: ${({ theme }) => theme.sizes.fileExplorer.statusBarHeight};
  padding: 0 4px 0 5px;
  position: absolute;
  white-space: nowrap;
  width: 100%;

  div {
    display: flex;
    margin-top: -1px;
    padding: 0 3px 0 9px;

    &::after {
      border-right: 1px solid rgb(247 247 247);
      content: "";
      height: 11px;
      margin-left: 12px;
      position: relative;
      top: 3px;
    }

    &.selected {
      padding-left: 7px;

      &::after {
        margin-left: 13px;
      }
    }
  }

  nav {
    display: flex;
    position: absolute;
    right: 4px;

    button {
      border: 1px solid transparent;
      display: flex;
      height: ${({ theme }) => theme.sizes.fileExplorer.statusBarHeight};
      place-content: center;
      place-items: center;
      width: 22px;

      picture {
        position: relative;
        top: -1px;
      }

      &:hover {
        background-color: rgb(77 77 77);
        border: 1px solid rgb(99 99 99);
      }

      &.active {
        background-color: rgb(102 102 102);
        border: 1px solid rgb(131 131 131);

        picture {
          padding-left: 1px;
          top: 0;
        }
      }
    }
  }
`;

export default StyledStatusBar;
