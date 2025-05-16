import styled from "styled-components";
import { MAX_ZINDEX } from "utils/constants";

const StyledScreenSaver = styled.iframe`
  background-color: transparent;
  border: none;
  height: 100%;
  inset: 0;
  outline: none;
  position: absolute;
  width: 100%;
  z-index: ${MAX_ZINDEX};
`;

export default StyledScreenSaver;
