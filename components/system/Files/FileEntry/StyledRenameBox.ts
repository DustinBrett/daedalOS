import styled from "styled-components";
import { MAX_FILE_NAME_LENGTH } from "utils/constants";

const StyledRenameBox = styled.textarea.attrs({
  autocomplete: "off",
  maxLength: MAX_FILE_NAME_LENGTH,
  rows: 1,
  spellCheck: false,
})`
  border: 1px solid rgb(100, 100, 100);
  font-family: inherit;
  font-size: 11.5px;
  margin-bottom: 2px;
  overflow: hidden;
  padding: ${({ theme }) => `1px ${theme.sizes.fileEntry.renamePadding}px`};
  position: relative;
  resize: none;
  text-align: center;
  top: 2px;
  white-space: break-spaces;
  width: ${({ theme }) => `${theme.sizes.fileEntry.renameWidth}px`};
  z-index: 1;
`;

export default StyledRenameBox;
