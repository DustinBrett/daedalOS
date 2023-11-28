import styled, { css } from "styled-components";
import { m as motion } from "framer-motion";
import StyledFileManager from "components/system/Files/Views/List/StyledFileManager";
import TaskbarPanel from "components/system/Taskbar/TaskbarPanel";
import ScrollBars from "styles/common/ScrollBars";
import { THIN_SCROLLBAR_WIDTH } from "utils/constants";

type StyledStartMenuProps = {
  $showScrolling: boolean;
};

const SCROLLBAR_PADDING_OFFSET = 3;
const HOVER_ADJUSTED_PADDING = THIN_SCROLLBAR_WIDTH - SCROLLBAR_PADDING_OFFSET;

const ThinScrollBars = css<StyledStartMenuProps>`
  &::-webkit-scrollbar {
    width: ${({ $showScrolling }) =>
      $showScrolling ? THIN_SCROLLBAR_WIDTH : SCROLLBAR_PADDING_OFFSET}px;
  }

  &::-webkit-scrollbar-corner,
  &::-webkit-scrollbar-track {
    background-color: ${({ $showScrolling }) =>
      $showScrolling ? undefined : "transparent"};
  }

  &::-webkit-scrollbar-button:single-button {
    background-color: ${({ $showScrolling }) =>
      $showScrolling ? undefined : "transparent"};
    border: ${({ $showScrolling }) =>
      $showScrolling ? undefined : "1px solid transparent"};
  }

  &::-webkit-scrollbar-thumb:vertical {
    background-color: ${({ $showScrolling }) =>
      $showScrolling ? undefined : "rgb(251, 241, 199)"};
  }
`;

const StyledStartMenu = styled(motion.nav)<StyledStartMenuProps>`
  ${({ theme }) =>
    TaskbarPanel(theme.sizes.startMenu.maxHeight, theme.sizes.startMenu.size)}

  ${StyledFileManager} {
    ${ScrollBars(THIN_SCROLLBAR_WIDTH, -2, -1)};
    margin-top: 0;
    padding-left: ${({ theme }) => theme.sizes.startMenu.sideBar.width}px;
    padding-right: ${THIN_SCROLLBAR_WIDTH}px;
    padding-top: 7px;
    scrollbar-width: none;

    ${StyledFileManager} {
      margin: 0;
      overflow: hidden;
      padding: 0;

      figure {
        picture {
          margin-left: 9px;
        }

        &:active {
          picture {
            margin-left: 13px;
          }
        }
      }
    }

    &::-webkit-scrollbar {
      width: 0;
    }

    &:hover {
      ${ThinScrollBars};
      padding-right: ${({ $showScrolling }) =>
        $showScrolling ? 0 : `${HOVER_ADJUSTED_PADDING}px`};

      @supports (scrollbar-width: thin) {
        padding-right: 5px;
        scrollbar-width: thin;
      }
    }

    @media (hover: none), (pointer: coarse) {
      ${ThinScrollBars};
      &::-webkit-scrollbar-track {
        margin: 13px 0;
      }
    }
  }
`;

export default StyledStartMenu;
