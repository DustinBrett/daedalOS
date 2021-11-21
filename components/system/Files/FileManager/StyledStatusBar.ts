import styled from "styled-components";

const StyledStatusBar = styled.footer`
  display: flex;
  width: 100%;
  height: ${({ theme }) => theme.sizes.fileExplorer.statusBarHeight};
  align-items: center;
  padding: 0 5px;
  background-color: rgb(51, 51, 51);
  color: #fff;
  font-size: 12px;
  font-weight: 100;
  white-space: nowrap;

  div {
    display: flex;
    padding: 0 3px 0 10px;
    margin-top: -1px;

    &::after {
      position: relative;
      top: 3px;
      height: 11px;
      border-right-width: 1px;
      border-right-style: solid;
      border-right-color: #fff;
      margin-left: 11px;
      content: "";
    }

    .selected {
      overflow: hidden;
      margin-right: 10px;
    }
  }
`;

export default StyledStatusBar;
