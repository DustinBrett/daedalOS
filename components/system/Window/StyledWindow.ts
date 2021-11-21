import { motion } from "framer-motion";
import styled from "styled-components";

type StyledWindowProps = {
  $foreground: boolean;
};

const StyledWindow = styled(motion.section)<StyledWindowProps>`
  position: absolute;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.window.background};
  box-shadow: ${({ $foreground, theme }) =>
    $foreground
      ? theme.colors.window.shadow
      : theme.colors.window.shadowInactive};
  contain: strict;
  outline: ${({ $foreground, theme }) =>
    `${theme.sizes.window.outline} solid ${
      $foreground
        ? theme.colors.window.outline
        : theme.colors.window.outlineInactive
    }`};

  header + * {
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.titleBar.height}) !important`};
  }
`;

export default StyledWindow;
