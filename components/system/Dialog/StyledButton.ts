import styled from "styled-components";

const StyledButton = styled.button`
  background-color: rgb(225, 225, 225);
  border: 1px solid rgb(173, 173, 173);
  font-family: ${({ theme }) => theme.formats.systemFont};
  font-size: 12px;
  height: 23px;
  transition: all 0.25s ease-in-out;
  width: 73px;

  &:focus {
    border: 2px solid rgb(0, 120, 215);
  }

  &:hover {
    background-color: rgb(229, 241, 251);
    border: 1px solid rgb(0, 120, 215);
  }

  &:active {
    background-color: rgb(204, 228, 247);
    border: 1px solid rgb(0, 84, 153);
    transition: none;
  }
`;

export default StyledButton;
