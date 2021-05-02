import styled from 'styled-components';

const StyledJSDOS = styled.div`
  background-color: #000;
  height: ${({ theme }) =>
    `calc(100% - ${theme.sizes.titleBar.height}) !important`};
  width: 100%;

  canvas {
    height: 100% !important;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    top: 0 !important;
    width: 100%;
  }

  div {
    display: none;
  }
`;

export default StyledJSDOS;
