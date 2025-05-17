import styled from "styled-components";
import StyledLoading from "components/system/Apps/StyledLoading";
import StyledDetailsFileManager from "components/system/Files/Views/Details/StyledFileManager";
import StyledIconFileManager from "components/system/Files/Views/Icon/StyledFileManager";

const StyledFileExplorer = styled.div`
  ${StyledDetailsFileManager}, ${StyledIconFileManager} {
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.fileExplorer.navBarHeight} - ${theme.sizes.fileExplorer.statusBarHeight})`};
  }

  ${StyledIconFileManager} {
    column-gap: 2px;
    padding: 6px 6px 6px 14px;

    figcaption {
      padding: 1px 0 2px;
    }
  }

  ${StyledLoading} {
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.fileExplorer.navBarHeight} - ${theme.sizes.fileExplorer.statusBarHeight})`};
    position: absolute;
  }
`;

export default StyledFileExplorer;
