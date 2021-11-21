import StyledFileEntry from "components/system/Files/Views/Icon/StyledFileEntry";
import StyledFileManager from "components/system/Files/Views/Icon/StyledFileManager";
import styled from "styled-components";

const StyledFileExplorer = styled.div`
  ${StyledFileManager} {
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.fileExplorer.navBarHeight} - ${theme.sizes.fileExplorer.statusBarHeight})`};
    padding-right: 5px;
    padding-left: 5px;
    column-gap: 2px;
  }

  ${StyledFileEntry} {
    &::before {
      border: 0 !important;
    }
  }
`;

export default StyledFileExplorer;
