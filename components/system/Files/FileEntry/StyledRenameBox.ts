import styled from "styled-components";
import { MAX_FILE_NAME_LENGTH } from "utils/constants";

const StyledRenameBox = styled.textarea.attrs({
  autocomplete: "off",
  maxLength: MAX_FILE_NAME_LENGTH,
  rows: 1,
  spellCheck: false,
})`
  position: relative;
  z-index: 1;
  top: 2px;
  overflow: hidden;
  min-width: 30px;
  max-width: ${({ theme }) => `${theme.sizes.fileEntry.renameWidth}px`};
  padding: ${({ theme }) => `1px ${theme.sizes.fileEntry.renamePadding}px`};
  border: 1px solid rgb(100, 100, 100);
  margin-bottom: 2px;
  font-family: inherit;
  font-size: 11.5px;
  resize: none;
  text-align: center;
  white-space: break-spaces;
`;

export default StyledRenameBox;
