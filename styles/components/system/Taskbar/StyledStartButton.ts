import styled from 'styled-components';
import Button from 'styles/common/Button';

const StyledStartButton = styled(Button)`
  color: ${({ theme }) => theme.colors.startButton};
  display: flex;
  font-size: ${({ theme }) => theme.sizes.startButton.iconSize};
  height: 100%;
  left: 0;
  place-content: center;
  place-items: center;
  position: absolute;
  width: ${({ theme }) => theme.sizes.startButton.width};

  &:hover {
    background-color: ${({ theme }) => theme.colors.taskbarHover};

    svg {
      color: ${({ theme }) => theme.colors.highlight};
    }
  }
`;

export default StyledStartButton;
