import styled from 'styled-components';

const StyledStartButton = styled.button`
  background-color: red;
  display: flex;
  height: 100%;
  left: 0;
  place-content: center;
  place-items: center;
  position: absolute;
  width: ${({ theme }) => theme.sizes.startButton.width};
`;

export default StyledStartButton;
