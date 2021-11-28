import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";
import { DEFAULT_SCROLLBAR_WIDTH } from "utils/constants";

const StyledTerminal = styled.div`
  width: 100%;
  height: 100%;

  .xterm-viewport {
    ${ScrollBars(DEFAULT_SCROLLBAR_WIDTH)};
  }
`;

export default StyledTerminal;
