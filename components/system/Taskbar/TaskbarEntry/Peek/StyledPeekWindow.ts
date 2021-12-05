import StyledTaskbarEntry from "components/system/Taskbar/TaskbarEntry/StyledTaskbarEntry";
import { motion } from "framer-motion";
import styled from "styled-components";

const StyledPeekWindow = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.taskbar.background};
  border: ${({ theme }) => `1px solid ${theme.colors.taskbar.peekBorder}`};
  border-bottom: 0;
  bottom: ${({ theme }) => theme.sizes.taskbar.height};
  display: flex;
  overflow: hidden;
  place-content: center;
  place-items: flex-start;
  position: fixed;

  ${StyledTaskbarEntry}:hover & {
    background-color: ${({ theme }) => theme.colors.taskbar.hover};

    &:active {
      background-color: ${({ theme }) => theme.colors.taskbar.activeForeground};
    }
  }

  img {
    height: ${({ theme }) => theme.sizes.taskbar.entry.peekImage.height};
    margin: ${({ theme }) => theme.sizes.taskbar.entry.peekImage.margin};
  }

  button {
    background-color: rgb(40, 40, 40);
    height: 32px;
    position: absolute;
    right: 0;
    top: 0;
    width: 32px;

    svg {
      fill: rgb(252, 246, 247);
      width: 12px;
    }

    &:active {
      background-color: rgb(139, 10, 20);
    }

    &:hover {
      background-color: rgb(194, 22, 36);
    }
  }
`;

export default StyledPeekWindow;
