import styled from "styled-components";

const StyledJSDOS = styled.div`
  align-items: center;
  background-color: #000;
  display: flex;
  height: 100%;
  width: 100%;

  canvas {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    position: absolute;
    top: 0 !important;
    width: 100%;
  }

  div,
  video {
    display: none;
  }
`;

export default StyledJSDOS;
