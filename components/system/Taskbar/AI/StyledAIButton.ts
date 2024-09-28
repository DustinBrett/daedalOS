import styled from "styled-components";

const StyledAIButton = styled.div`
  contain: strict;
  display: flex;
  height: 100%;
  place-content: center;
  place-items: center;
  position: absolute;
  right: 0;
  width: ${({ theme }) => theme.sizes.taskbar.ai.buttonWidth};

  svg {
    height: 22px;
    width: 22px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.taskbar.hover};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.taskbar.foreground};
  }
`;

export default StyledAIButton;
