import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";
import { DEFAULT_SCROLLBAR_WIDTH } from "utils/constants";

const StyledTerminal = styled.div`
  height: 100%;
  width: 100%;

  .terminal {
    backdrop-filter: blur(8px);
    height: 100% !important;
  }

  .xterm-viewport {
    ${ScrollBars(DEFAULT_SCROLLBAR_WIDTH)};

    width: 100% !important;
  }
`;

export default StyledTerminal;
