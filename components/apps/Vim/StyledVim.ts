import styled from "styled-components";

const StyledVim = styled.div`
  #vimjs-canvas {
    image-rendering: pixelated;
  }

  #vimjs-container {
    height: 100%;
    width: 100%;
  }

  #vimjs-file {
    display: none;
  }

  #vimjs-font-test {
    position: absolute;
    visibility: hidden;
  }
`;

export default StyledVim;
