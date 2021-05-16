import styled from 'styled-components';

const StyledJSDOS = styled.div`
  align-items: center;
  background-color: #000;
  display: flex;
  height: ${({ theme }) =>
    `calc(100% - ${theme.sizes.titleBar.height}) !important`};
  width: 100%;

  canvas {
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
