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

  #loading-status {
    background-color: #fff;
    border-radius: 10px;
    display: none;
    font-weight: 600;
    left: 50%;
    padding: 15px;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    user-select: none;
  }

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
