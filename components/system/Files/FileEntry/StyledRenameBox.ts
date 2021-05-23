import styled from 'styled-components';

const StyledRenameBox = styled.input.attrs({
  spellCheck: false,
  type: 'text'
})`
  border: 1px solid rgb(100, 100, 100);
  font-family: inherit;
  font-size: 11.5px;
  margin-bottom: 2px;
  padding: 1px 5px;
  position: relative;
  text-align: center;
  top: 2px;
  width: 64px;
`;

export default StyledRenameBox;
