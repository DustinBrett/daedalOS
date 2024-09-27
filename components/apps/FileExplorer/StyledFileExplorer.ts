import styled from "styled-components";
import StyledLoading from "components/system/Files/FileManager/StyledLoading";
import StyledIconFileManager from "components/system/Files/Views/Icon/StyledFileManager";

const StyledFileExplorer = styled.div`
  ${StyledIconFileManager} {
    column-gap: 2px;
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.fileExplorer.navBarHeight} - ${theme.sizes.fileExplorer.statusBarHeight})`};
    padding: 6px;

    figcaption {
      padding: 1px 0 2px;
    }
  }

  ${StyledLoading} {
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.fileExplorer.navBarHeight} - ${theme.sizes.fileExplorer.statusBarHeight})`};
  }
`;

export default StyledFileExplorer;
