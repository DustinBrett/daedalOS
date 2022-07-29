import { m as motion } from "framer-motion";
import styled from "styled-components";

type StyledWebampProps = {
  $minimized: boolean;
};

const StyledWebamp = styled(motion.div)<StyledWebampProps>`
  inset: 0;
  pointer-events: none;
  position: absolute;

  div:first-child {
    pointer-events: ${({ $minimized }) => ($minimized ? "none" : "auto")};
  }
`;

export default StyledWebamp;
