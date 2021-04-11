import styled from 'styled-components';

const StyledTaskbar = styled.nav`
  backdrop-filter: ${({ theme }) => `blur(${theme.sizes.taskbar.blur})`};
  background-color: ${({ theme }) => theme.colors.taskbar.background};
  bottom: 0;
  height: ${({ theme }) => theme.sizes.taskbar.height};
  left: 0;
  position: absolute;
  right: 0;
  width: 100vw;
  z-index: 1000;
`;

export default StyledTaskbar;
