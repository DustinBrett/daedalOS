import type { StyledFileManagerProps } from "components/system/Files/Views";
import StyledWindow from "components/system/Window/StyledWindow";
import styled from "styled-components";

const StyledFileManager = styled.ol<StyledFileManagerProps>`
  column-gap: ${({ theme }) => theme.sizes.fileManager.columnGap};
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: ${({ theme }) =>
    `repeat(auto-fill, ${theme.sizes.fileManager.gridEntryWidth})`};
  grid-template-rows: ${({ theme }) =>
    `repeat(auto-fill, ${theme.sizes.fileManager.gridEntryHeight})`};
  height: ${({ theme }) => `calc(100% - ${theme.sizes.taskbar.height})`};
  padding: ${({ theme }) => theme.sizes.fileManager.padding};
  pointer-events: ${({ selecting }) => (selecting ? "auto" : undefined)};
  row-gap: ${({ theme }) => theme.sizes.fileManager.rowGap};

  main > & {
    padding-bottom: 20px;
  }

  ${StyledWindow} & {
    grid-auto-flow: row;
  }
`;

export default StyledFileManager;
