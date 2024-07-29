import styled from "styled-components";
import StyledLoading from "components/system/Files/FileManager/StyledLoading";
import StyledFileManager from "components/system/Files/Views/Icon/StyledFileManager";

const StyledFileExplorer = styled.div`
  ${StyledFileManager} {
    column-gap: 2px;
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.fileExplorer.navBarHeight} - ${theme.sizes.fileExplorer.statusBarHeight})`};
    padding-left: 5px;
    padding-right: 5px;
  }

  ${StyledLoading} {
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.fileExplorer.navBarHeight} - ${theme.sizes.fileExplorer.statusBarHeight})`};
  }
`;

export default StyledFileExplorer;
