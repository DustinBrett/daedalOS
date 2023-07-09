import styled from "styled-components";

const BASE_LINE_HEIGHT = 21;

const StyledButton = styled.button`
  background-color: rgb(235, 219, 178);
  border: 1px solid rgb(168, 153, 132);
  display: grid;
  font-family: ${({ theme }) => theme.formats.systemFont};
  font-size: 12px;
  height: 23px;
  line-height: ${BASE_LINE_HEIGHT}px;
  transition: background-color 0.25s ease;
  width: 73px;

  &:focus,
  &.focus {
    border: 2px solid rgb(69, 133, 136);
    line-height: ${BASE_LINE_HEIGHT - 2}px;
  }

  &:hover {
    background-color: rgb(213, 196, 161);
    border: 1px solid rgb(69, 133, 136);
    line-height: ${BASE_LINE_HEIGHT}px;
  }

  &:active {
    background-color: rgb(204, 228, 247);
    border: 1px solid rgb(7, 102, 120);
    line-height: ${BASE_LINE_HEIGHT}px;
    transition: none;
  }

  &:disabled {
    background-color: rgb(213, 196, 161);
    border: 1px solid rgb(189, 174, 147);
    line-height: ${BASE_LINE_HEIGHT}px;
  }
`;

export default StyledButton;
