import { motion } from "framer-motion";
import styled from "styled-components";

const StyledStartMenu = styled(motion.nav)`
  backdrop-filter: blur(12px);
  background-color: hsla(0, 0%, 12%, 70%);
  bottom: ${({ theme }) => theme.sizes.taskbar.height};
  display: flex;
  height: ${({ theme }) => theme.sizes.startMenu.height};
  left: 0;
  position: absolute;
  width: 320px;
  z-index: 1000;
`;

export default StyledStartMenu;
