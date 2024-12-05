import styled from "styled-components";
import { TASKBAR_HEIGHT } from "utils/constants";

const StyledTaskbar = styled.nav`

  background-color: rgba(0,0,0,0.8);
  bottom: 0;
  contain: size layout;
  height: ${TASKBAR_HEIGHT}px;
  left: 0;
  position: sticky;
  right: 0;
  top: 0vh;
  width: 100vw;
  z-index: 100000;
`;

export default StyledTaskbar;
