import type { StyledFileManagerProps } from "components/system/Files/Views";
import StyledWindow from "components/system/Window/StyledWindow";
import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";
import { DEFAULT_SCROLLBAR_WIDTH } from "utils/constants";

const StyledFileManager = styled.ol<StyledFileManagerProps>`
  ${ScrollBars(DEFAULT_SCROLLBAR_WIDTH)};

  display: grid;
  overflow: ${({ scrollable }) => (scrollable ? undefined : "hidden")};
  height: 100%;
  padding: ${({ theme }) => theme.sizes.fileManager.padding};
  column-gap: ${({ theme }) => theme.sizes.fileManager.columnGap};
  contain: strict;
  grid-auto-flow: column;
  grid-template-columns: ${({ theme }) =>
    `repeat(auto-fill, ${theme.sizes.fileManager.gridEntryWidth})`};
  grid-template-rows: ${({ theme }) =>
    `repeat(auto-fill, ${theme.sizes.fileManager.gridEntryHeight})`};
  pointer-events: ${({ selecting }) => (selecting ? "auto" : undefined)};
  row-gap: ${({ theme }) => theme.sizes.fileManager.rowGap};

  main > & {
    overflow: visible;
    height: ${({ theme }) => `calc(100% - ${theme.sizes.taskbar.height})`};
    padding-bottom: 21px;
  }

  ${StyledWindow} & {
    grid-auto-flow: row;
  }
`;

export default StyledFileManager;
