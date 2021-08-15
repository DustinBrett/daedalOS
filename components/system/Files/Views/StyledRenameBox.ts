import styled from "styled-components";

const StyledRenameBox = styled.textarea.attrs({
  autocomplete: "off",
  rows: 1,
  spellCheck: false,
})`
  border: 1px solid rgb(100, 100, 100);
  font-family: inherit;
  font-size: 11.5px;
  margin-bottom: 2px;
  padding: 1px 5px;
  position: relative;
  resize: none;
  text-align: center;
  top: 2px;
  width: 70px;
`;

export default StyledRenameBox;
