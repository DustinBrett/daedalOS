import { motion } from 'framer-motion';
import styled from 'styled-components';

type StyledWindowProps = {
  foreground: boolean;
};

const StyledWindow = styled(motion.section)<StyledWindowProps>`
  background-color: ${({ theme }) => theme.colors.window.background};
  box-shadow: ${({ foreground, theme }) =>
    foreground
      ? theme.colors.window.shadow
      : theme.colors.window.shadowInactive};
  height: 100%;
  outline: ${({ foreground, theme }) =>
    `${theme.sizes.window.outline} solid ${
      foreground
        ? theme.colors.window.outline
        : theme.colors.window.outlineInactive
    }`};
  overflow: hidden;
  position: absolute;
  width: 100%;
`;

export default StyledWindow;
