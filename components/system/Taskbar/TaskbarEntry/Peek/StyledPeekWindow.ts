import { m as motion } from "motion/react";
import styled from "styled-components";
import StyledTaskbarEntry from "components/system/Taskbar/TaskbarEntry/StyledTaskbarEntry";
import { PEEK_MAX_WIDTH, TASKBAR_HEIGHT } from "utils/constants";

type StyledPeekWindowProps = {
  $offsetX: number;
};

const StyledPeekWindow = styled(motion.div)<StyledPeekWindowProps>`
  backdrop-filter: ${({ theme }) => `blur(${theme.sizes.taskbar.blur})`};
  background-color: ${({ theme }) => theme.colors.taskbar.background};
  border: ${({ theme }) => `1px solid ${theme.colors.taskbar.peekBorder}`};
  border-bottom: 0;
  bottom: ${TASKBAR_HEIGHT}px;
  display: flex;
  overflow: hidden;
  place-content: center;
  place-items: flex-start;
  position: fixed;
  transform: ${({ $offsetX }) =>
    $offsetX ? `translateX(${$offsetX}px)` : undefined};

  ${StyledTaskbarEntry}:hover & {
    background-color: hsl(0 0% 25% / 70%);

    &:active {
      background-color: ${({ theme }) => theme.colors.taskbar.activeForeground};
    }
  }

  img {
    height: ${({ theme }) => theme.sizes.taskbar.entry.peekImage.height}px;
    margin: ${({ theme }) => theme.sizes.taskbar.entry.peekImage.margin}px;
    max-height: ${PEEK_MAX_WIDTH}px;
    max-width: ${PEEK_MAX_WIDTH}px;
    min-height: 80px;
    min-width: 80px;
    object-fit: contain;
  }

  button.close {
    background-color: rgb(40 40 40);
    height: 32px;
    position: absolute;
    right: 0;
    top: 0;
    width: 32px;

    svg {
      fill: rgb(252 246 247);
      width: 12px;
    }

    &:active {
      background-color: rgb(139 10 20) !important;
    }

    &:hover {
      background-color: rgb(194 22 36);
    }
  }

  .controls {
    display: flex;
    place-content: center;
    position: absolute;
    top: ${({ theme }) =>
      theme.sizes.taskbar.entry.peekImage.height +
      theme.sizes.taskbar.entry.peekImage.margin * 2}px;
    width: 100%;

    button {
      background-color: rgb(70 70 70);
      border: 1px solid rgb(46 46 46);
      display: flex;
      height: 27px;
      place-content: center;
      place-items: center;
      width: 27px;

      &:active {
        background-color: rgb(61 96 153) !important;
        border: 1px solid rgb(49 77 122) !important;
      }

      &:hover {
        background-color: rgb(54 101 179);
        border: 1px solid rgb(43 81 143);
      }

      svg {
        fill: #fff;
        height: 16px;
        margin-left: 1px;
        pointer-events: none;
        user-select: none;
        width: 16px;
      }
    }
  }
`;

export default StyledPeekWindow;
