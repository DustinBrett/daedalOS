import styled from "styled-components";
import { TASKBAR_HEIGHT } from "utils/constants";

const TASKBAR_Z_INDEX = 100000;

const StyledTaskbar = styled.nav`
  background-color: ${({ theme }) => theme.colors.taskbar.background};
  bottom: 0;
  contain: size layout;
  height: ${TASKBAR_HEIGHT}px;
  left: 0;
  position: absolute;
  right: 0;
  width: 100vw;
  z-index: ${TASKBAR_Z_INDEX};

  &::after {
    backdrop-filter: ${({ theme }) => `blur(${theme.sizes.taskbar.blur})`};
    content: "";
    display: block;
    height: 100%;
    position: relative;
    width: 100%;
    z-index: -${TASKBAR_Z_INDEX};
  }
`;

export default StyledTaskbar;
