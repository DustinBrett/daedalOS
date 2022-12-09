import styled from "styled-components";

const StyledDesktop = styled.main`
  background: rgb(219,203,55);
  background: linear-gradient(90deg, rgba(219,203,55,1) 0%, rgba(43,173,193,1) 35%, rgba(244,189,207,1) 100%);
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
