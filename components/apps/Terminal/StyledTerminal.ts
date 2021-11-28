import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledTerminal = styled.div`
  width: 100%;
  height: 100%;

  .xterm-viewport {
    ${ScrollBars(17)};
  }
`;

export default StyledTerminal;
