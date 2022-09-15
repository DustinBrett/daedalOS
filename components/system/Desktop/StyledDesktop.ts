import styled from "styled-components";

const StyledDesktop = styled.main`
  background-color: ${({ theme }) => theme.colors.background};
  background-position: center;
  contain: strict;
  height: 100%;
  inset: 0;
  overscroll-behavior: none;
  position: fixed;
  width: 100vw;

  > canvas {
    background-color: inherit;
    height: 100%;
    left: 0;
    object-fit: cover;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: -1;
  }
`;

export default StyledDesktop;
