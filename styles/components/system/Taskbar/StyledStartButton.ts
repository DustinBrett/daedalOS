import styled from 'styled-components';

const StyledStartButton = styled.button.attrs({
  type: 'button'
})`
  color: ${({ theme }) => theme.colors.startButton};
  display: flex;
  font-size: ${({ theme }) => theme.sizes.startButton.iconSize};
  height: 100%;
  left: 0;
  place-content: center;
  place-items: center;
  position: absolute;
  width: ${({ theme }) => theme.sizes.startButton.width};
`;

export default StyledStartButton;
