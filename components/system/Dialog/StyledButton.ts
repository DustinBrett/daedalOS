import styled from "styled-components";

type StyledButtonProps = {
  $active?: boolean;
};

const StyledButton = styled.button<StyledButtonProps>`
  background-color: rgb(225, 225, 225);
  border: ${({ $active }) =>
    $active ? "2px solid rgb(0, 120, 215)" : "1px solid rgb(173, 173, 173)"};
  font-family: ${({ theme }) => theme.formats.systemFont};
  font-size: 12px;
  height: 23px;
  transition: all 0.25s ease;
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

  &:disabled {
    background-color: rgb(204, 204, 204);
    border: 1px solid rgb(191, 191, 191);
  }
`;

export default StyledButton;
