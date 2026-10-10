import styled from "styled-components";
import { StyledSelectionComponent } from "components/system/Files/FileManager/Selection/StyledSelection";
import { type StyledFileManagerProps } from "components/system/Files/Views";
import ScrollBars from "styles/common/ScrollBars";

const StyledFileManager = styled.ol<StyledFileManagerProps>`
  ${({ $scrollable }) => ($scrollable ? ScrollBars() : undefined)};

  contain: strict;
  overflow: ${({ $isEmptyFolder, $scrollable }) =>
    !$isEmptyFolder && $scrollable ? undefined : "hidden"};
  pointer-events: ${({ $selecting }) => ($selecting ? "auto" : undefined)};

  /* Keyboard scrolling keeps entries below the column headers & their gap */
  scroll-padding-top: ${({ theme }) =>
    theme.sizes.fileManager.columnHeight + 6}px;
  scrollbar-gutter: auto;

  picture:not(:first-of-type) {
    position: absolute;
  }

  ${StyledSelectionComponent} {
    top: 0;
  }
`;

export default StyledFileManager;
