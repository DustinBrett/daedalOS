import { m as motion } from "motion/react";
import styled from "styled-components";

type StyledWebampProps = {
  $minimized: boolean;
  $zIndex: number;
};

const StyledWebamp = styled(motion.div)<StyledWebampProps>`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: ${({ $zIndex }) => $zIndex};

  div:first-child {
    pointer-events: ${({ $minimized }) => ($minimized ? "none" : "auto")};
  }
`;

export default StyledWebamp;
