import styled from "styled-components";

const StyledJSDOS = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  background-color: #000;

  canvas {
    top: 0 !important;
    width: 100%;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }

  div,
  video {
    display: none;
  }
`;

export default StyledJSDOS;
