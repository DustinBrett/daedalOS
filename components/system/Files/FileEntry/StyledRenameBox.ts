import styled from "styled-components";
import {
  DISBALE_AUTO_INPUT_FEATURES,
  MAX_FILE_NAME_LENGTH,
} from "utils/constants";

type StyledRenameBoxProps = {
  $darkMode: boolean;
};

const StyledRenameBox = styled.textarea.attrs<StyledRenameBoxProps>(() => ({
  enterKeyHint: "done",
  maxLength: MAX_FILE_NAME_LENGTH,
  rows: 1,
  ...DISBALE_AUTO_INPUT_FEATURES,
}))`
  background-color: ${({ $darkMode }) =>
    $darkMode ? "rgb(33, 33, 33)" : "#fff"};
  border: ${({ $darkMode }) =>
    `1px solid ${$darkMode ? "#fff" : "rgb(100, 100, 100)"}`};
  border-radius: 0;
  color: ${({ $darkMode }) => ($darkMode ? "#fff" : "#000")};
  font-family: inherit;
  font-size: 11.5px;
  margin-bottom: 2px;
  max-width: ${({ theme }) => theme.sizes.fileEntry.renameWidth}px;
  min-height: 19px;
  min-width: 30px;
  overflow: hidden;
  padding: ${({ theme }) => `1px ${theme.sizes.fileEntry.renamePadding}px`};
  position: relative;
  resize: none;
  text-align: center;
  top: 2px;
  user-select: text;
  white-space: break-spaces;
  z-index: 1;
`;

export default StyledRenameBox;
