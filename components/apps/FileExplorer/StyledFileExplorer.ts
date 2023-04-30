import StyledLoading from "components/system/Files/FileManager/StyledLoading";
import StyledFileEntry from "components/system/Files/Views/Icon/StyledFileEntry";
import StyledFileManager from "components/system/Files/Views/Icon/StyledFileManager";
import type { DefaultTheme } from "styled-components";
import styled from "styled-components";

interface StyledFileExplorerProps {
  showNavigation: boolean;
  showStatusBar: boolean;
}

const navBarHeight = (theme: DefaultTheme): string =>
  theme.sizes.fileExplorer.navBarHeight;
const statusBarHeight = (theme: DefaultTheme): string =>
  theme.sizes.fileExplorer.statusBarHeight;

const StyledFileExplorer = styled.div<StyledFileExplorerProps>`
  ${StyledFileManager} {
    column-gap: 2px;
    height: ${({ theme, showNavigation, showStatusBar }) =>
      `calc(100% - ${showNavigation ? navBarHeight(theme) : 0} - ${
        showStatusBar ? statusBarHeight(theme) : 0
      })`};
    padding-left: 5px;
    padding-right: 5px;
    backdrop-filter: ${({ theme }) =>
      theme.colors.fileExplorer?.backdropFilter || "none"};
  }

  ${StyledLoading} {
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.fileExplorer.navBarHeight} - ${theme.sizes.fileExplorer.statusBarHeight})`};
  }

  ${StyledFileEntry} {
    &:hover {
      &::before {
        border-width: 0;
      }
    }

    &::before {
      border-width: 0;
    }
  }
`;

export default StyledFileExplorer;
