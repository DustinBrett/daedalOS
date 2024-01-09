import styled from "styled-components";
import { type StyledFileManagerProps } from "components/system/Files/Views";
import ScrollBars from "styles/common/ScrollBars";
import { TASKBAR_HEIGHT } from "utils/constants";

const StyledFileManager = styled.ol<StyledFileManagerProps>`
  ${({ $scrollable }) => ($scrollable ? ScrollBars() : undefined)};

  contain: strict;
  display: grid;
  gap: ${({ theme }) =>
    `${theme.sizes.fileManager.rowGap} ${theme.sizes.fileManager.columnGap}`};
  grid-auto-flow: row;
  grid-template-columns: ${({ theme }) =>
    `repeat(auto-fill, ${theme.sizes.fileManager.gridEntryWidth})`};
  grid-template-rows: ${({ theme }) =>
    `repeat(auto-fill, ${theme.sizes.fileManager.gridEntryHeight})`};
  height: 100%;
  overflow: ${({ $isEmptyFolder, $scrollable }) =>
    !$isEmptyFolder && $scrollable ? undefined : "hidden"};
  padding: ${({ theme }) => theme.sizes.fileManager.padding};
  place-content: flex-start;
  pointer-events: ${({ $selecting }) => ($selecting ? "auto" : undefined)};

  main > & {
    grid-auto-flow: column;
    height: calc(100% - ${TASKBAR_HEIGHT}px);
    overflow: visible;
    padding-bottom: 21px;
  }
`;

export default StyledFileManager;
