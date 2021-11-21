import { motion } from "framer-motion";
import styled from "styled-components";

type StyledTaskbarEntryProps = {
  $foreground: boolean;
};

const StyledTaskbarEntry = styled(motion.li)<StyledTaskbarEntryProps>`
  position: relative;
  display: flex;
  overflow: hidden;
  width: ${({ theme }) => theme.sizes.taskbar.entry.maxWidth};
  min-width: 0;
  place-content: center;

  &::before {
    position: absolute;
    z-index: -1;
    bottom: 0;
    width: ${({ $foreground }) => ($foreground ? "100%" : `calc(100% - 8px)`)};
    height: ${({ $foreground }) => ($foreground ? "100%" : 0)};
    border-bottom: ${({ theme }) => `
        ${theme.sizes.taskbar.entry.borderSize} solid ${theme.colors.highlight}
      `};
    margin: ${({ $foreground }) => ($foreground ? "" : "0 4px")};
    background-color: ${({ $foreground, theme }) =>
      $foreground ? theme.colors.taskbar.foreground : ""};
    content: "";
    transition-duration: 0.1s;
    transition-property: ${({ $foreground }) =>
      $foreground ? "all" : "width"};
  }

  &:hover {
    &::before {
      width: 100%;
      height: 100%;
      margin: 0;
      background-color: ${({ $foreground, theme }) =>
        $foreground
          ? theme.colors.taskbar.foregroundHover
          : theme.colors.taskbar.hover};
    }
  }

  &:active {
    &::before {
      background-color: ${({ $foreground, theme }) =>
        $foreground
          ? theme.colors.taskbar.activeForeground
          : theme.colors.taskbar.active};
    }
  }

  figure {
    display: flex;
    align-items: center;
    padding: 4px;
    margin-bottom: ${({ theme }) => theme.sizes.taskbar.entry.borderSize};
    margin-left: 4px;

    figcaption {
      margin-left: 5px;
      color: ${({ theme }) => theme.colors.text};
      font-size: ${({ theme }) => theme.sizes.taskbar.entry.fontSize};
      letter-spacing: -0.1px;
      overflow-x: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    img {
      position: relative;
      top: 1px;
      width: ${({ theme }) => theme.sizes.taskbar.entry.iconSize};
      height: ${({ theme }) => theme.sizes.taskbar.entry.iconSize};
    }
  }
`;

export default StyledTaskbarEntry;
