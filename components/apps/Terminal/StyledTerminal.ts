import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledTerminal = styled.div`
  height: 100%;
  width: 100%;

  .terminal {
    backdrop-filter: blur(8px);
    height: 100% !important;
  }

  .xterm-viewport {
    ${ScrollBars()};
    width: 100% !important;
  }

  .xterm-cursor-underline {
    border-bottom-color: #ebdbb2 !important;
    border-bottom-width: 4px !important;
    font-size: 15px !important;
  }

  .xterm-cursor-blink {
    animation-duration: 1.067s !important;
  }
`;

export default StyledTerminal;
