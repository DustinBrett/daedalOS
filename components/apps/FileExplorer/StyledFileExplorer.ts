import StyledFileEntry from "components/system/Files/Views/Icon/StyledFileEntry";
import StyledFileManager from "components/system/Files/Views/Icon/StyledFileManager";
import styled from "styled-components";

const StyledFileExplorer = styled.div`
  ${StyledFileManager} {
    column-gap: 2px;
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.fileExplorer.navBarHeight} - ${theme.sizes.fileExplorer.statusBarHeight})`};
    padding-left: 5px;
    padding-right: 5px;
  }

  ${StyledFileEntry} {
    &::before {
      border: 0 !important;
    }
  }
`;

export default StyledFileExplorer;
