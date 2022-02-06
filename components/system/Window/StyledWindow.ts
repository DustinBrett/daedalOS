import StyledTitlebar from "components/system/Window/Titlebar/StyledTitlebar";
import { motion } from "framer-motion";
import styled from "styled-components";

type StyledWindowProps = {
  $foreground: boolean;
};

const StyledWindow = styled(motion.section)<StyledWindowProps>`
  background-color: ${({ theme }) => theme.colors.window.background};
  box-shadow: ${({ $foreground, theme }) =>
    $foreground
      ? theme.colors.window.shadow
      : theme.colors.window.shadowInactive};
  contain: strict;
  height: 100%;
  outline: ${({ $foreground, theme }) =>
    `${theme.sizes.window.outline} solid ${
      $foreground
        ? theme.colors.window.outline
        : theme.colors.window.outlineInactive
    }`};
  overflow: hidden;
  position: absolute;
  width: 100%;

  ${StyledTitlebar} + * {
    height: ${({ theme }) =>
      `calc(100% - ${theme.sizes.titleBar.height}) !important`};
  }
`;

export default StyledWindow;
