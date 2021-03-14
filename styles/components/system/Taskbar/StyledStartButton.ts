import styled from 'styled-components';
import Button from 'styles/common/Button';

const StyledStartButton = styled(Button)`
  display: flex;
  fill: ${({ theme }) => theme.colors.startButton};
  height: 100%;
  left: 0;
  place-content: center;
  place-items: center;
  position: absolute;
  width: ${({ theme }) => theme.sizes.startButton.width};

  svg {
    height: 19px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.taskbarHover};

    svg {
      fill: ${({ theme }) => theme.colors.highlight};
    }
  }
`;

export default StyledStartButton;
