import StyledFileExplorer from "components/apps/FileExplorer/StyledFileExplorer";
import styled from "styled-components";

const StyledLoading = styled.div`
  width: 100%;
  height: 100%;
  cursor: wait;

  ${StyledFileExplorer} & {
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.fileExplorer.navBarHeight} - ${theme.sizes.fileExplorer.statusBarHeight})`};
  }

  &::before {
    display: flex;
    justify-content: center;
    padding-top: 18px;
    color: #fff;
    content: "Working on it...";
    font-size: 12px;
    mix-blend-mode: difference;
  }
`;

export default StyledLoading;
