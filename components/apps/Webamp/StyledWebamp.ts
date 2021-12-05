import { motion } from "framer-motion";
import styled from "styled-components";

const StyledWebamp = styled(motion.div)`
  contain: strict;
  inset: 0;
  pointer-events: none;
  position: absolute;

  div:first-child {
    pointer-events: auto;
  }
`;

export default StyledWebamp;
