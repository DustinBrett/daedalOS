import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";
import { DEFAULT_SCROLLBAR_WIDTH } from "utils/constants";

const StyledTerminal = styled.div`
  height: 100%;
  width: 100%;

  .xterm-viewport {
    ${ScrollBars(DEFAULT_SCROLLBAR_WIDTH)};
  }
`;

export default StyledTerminal;
