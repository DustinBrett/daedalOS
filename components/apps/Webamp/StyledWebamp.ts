import { motion } from "framer-motion";
import styled from "styled-components";

const StyledWebamp = styled(motion.div)`
  bottom: 0;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;

  div:first-child {
    pointer-events: auto;
  }
`;

export default StyledWebamp;
