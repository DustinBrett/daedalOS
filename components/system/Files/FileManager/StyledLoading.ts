import StyledFileExplorer from "components/apps/FileExplorer/StyledFileExplorer";
import styled from "styled-components";

const StyledLoading = styled.div`
  cursor: wait;
  height: 100%;
  width: 100%;

  ${StyledFileExplorer} & {
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.fileExplorer.navBarHeight} - ${theme.sizes.fileExplorer.statusBarHeight})`};
  }

  &::before {
    color: #fff;
    content: "Working on it...";
    display: flex;
    font-size: 12px;
    justify-content: center;
    mix-blend-mode: difference;
    padding-top: 18px;
  }
`;

export default StyledLoading;
