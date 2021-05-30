import styled from 'styled-components';

const StyledStartMenu = styled.nav`
  backdrop-filter: blur(10px);
  background-color: hsla(0, 0%, 12.5%, 70%);
  bottom: ${({ theme }) => theme.sizes.taskbar.height};
  height: 390px;
  left: 0;
  position: absolute;
  width: 320px;
  z-index: 1000;
`;

export default StyledStartMenu;
