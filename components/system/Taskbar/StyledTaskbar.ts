import styled from "styled-components";

const StyledTaskbar = styled.nav`
  position: absolute;
  z-index: 1000;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: ${({ theme }) => theme.sizes.taskbar.height};
  backdrop-filter: ${({ theme }) => `blur(${theme.sizes.taskbar.blur})`};
  background-color: ${({ theme }) => theme.colors.taskbar.background};
  contain: size layout;
`;

export default StyledTaskbar;
