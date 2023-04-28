import styled from "styled-components";

type StyledDesktopProps = {
  $height: number;
};

const StyledDesktop = styled.main<StyledDesktopProps>`
  background-color: transparent;
  contain: strict;
  height: ${({ $height }) => ($height ? `${$height}px` : "100%")};
  inset: 0;
  overscroll-behavior: none;
  position: fixed;
  width: 100vw;

  > canvas {
    background-color: inherit;
    height: ${({ $height }) => ($height ? `${$height}px` : "100%")};
    left: 0;
    object-fit: cover;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: -1;
  }
`;

export default StyledDesktop;
