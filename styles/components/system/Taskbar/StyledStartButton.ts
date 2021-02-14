import styled from 'styled-components';

const StyledStartButton = styled.button`
  background-color: red;
  height: 100%;
  left: 0;
  position: absolute;
  width: ${({ theme }) => theme.sizes.startButton.width};
`;

export default StyledStartButton;
