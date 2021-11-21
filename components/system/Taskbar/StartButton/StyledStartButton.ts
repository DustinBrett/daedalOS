import styled from "styled-components";
import Button from "styles/common/Button";

type StyledStartButtonProps = {
  $active: boolean;
};

const StyledStartButton = styled(Button)<StyledStartButtonProps>`
  position: absolute;
  left: 0;
  display: flex;
  width: ${({ theme }) => theme.sizes.startButton.width};
  height: 100%;
  background-color: ${({ $active, theme }) =>
    $active && theme.colors.taskbar.foreground};
  fill: ${({ theme }) => theme.colors.startButton};
  place-content: center;
  place-items: center;

  svg {
    height: ${({ theme }) => theme.sizes.startButton.iconSize};
  }

  &:hover {
    background-color: ${({ $active, theme }) =>
      !$active && theme.colors.taskbar.hover};

    svg {
      fill: ${({ theme }) => theme.colors.highlight};
    }
  }

  &:active {
    background-color: hsla(0, 0%, 20%, 70%);

    svg {
      fill: hsla(207, 100%, 60%, 80%);
    }
  }
`;

export default StyledStartButton;
