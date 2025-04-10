import styled from "styled-components";

const BASE_LINE_HEIGHT = 21;

const StyledButton = styled.button`
  background-color: rgb(225 225 225);
  border: 1px solid rgb(173 173 173);
  color: #000;
  display: grid;
  font-family: ${({ theme }) => theme.formats.systemFont};
  font-size: 12px;
  height: 23px;
  line-height: ${BASE_LINE_HEIGHT}px;
  transition: background-color 0.25s ease;
  width: 73px;

  &:focus,
  &.focus {
    border: 2px solid rgb(0 120 215);
    line-height: ${BASE_LINE_HEIGHT - 2}px;
  }

  &:hover {
    background-color: rgb(229 241 251);
    border: 1px solid rgb(0 120 215);
    line-height: ${BASE_LINE_HEIGHT}px;
  }

  &:active {
    background-color: rgb(204 228 247);
    border: 1px solid rgb(0 84 153);
    line-height: ${BASE_LINE_HEIGHT}px;
    transition: none;
  }

  &:disabled {
    background-color: rgb(204 204 204);
    border: 1px solid rgb(191 191 191);
    color: #808080;
    line-height: ${BASE_LINE_HEIGHT}px;
  }
`;

export default StyledButton;
