import styled from "styled-components";
import { m as motion } from "motion/react";
import StyledFileEntry from "components/system/Files/Views/List/StyledFileEntry";
import StyledFileManager from "components/system/Files/Views/List/StyledFileManager";
import TaskbarPanel from "components/system/Taskbar/TaskbarPanel";
import ScrollBars from "styles/common/ScrollBars";
import {
  THIN_SCROLLBAR_WIDTH,
  THIN_SCROLLBAR_WIDTH_NON_WEBKIT,
} from "utils/constants";

type StyledStartMenuProps = {
  $showScrolling: boolean;
};

const StyledStartMenu = styled(motion.nav)<StyledStartMenuProps>`
  ${({ theme }) =>
    TaskbarPanel(theme.sizes.startMenu.maxHeight, theme.sizes.startMenu.size)}

  backdrop-filter: ${({ theme }) => `blur(${theme.sizes.taskbar.panelBlur})`};

  ${StyledFileManager} {
    ${ScrollBars(THIN_SCROLLBAR_WIDTH, -2, -1)};
    margin-top: 0;
    overflow-x: hidden;
    padding-bottom: ${({ theme }) =>
      theme.sizes.startMenu.sideBar.buttonHeight / 2}px;
    padding-left: ${({ theme }) => theme.sizes.startMenu.sideBar.width}px;
    padding-top: 7px;

    ${StyledFileEntry} {
      width: ${({ theme }) =>
        `${theme.sizes.startMenu.size - theme.sizes.startMenu.sideBar.width - THIN_SCROLLBAR_WIDTH}px`};

      @supports not selector(::-webkit-scrollbar) {
        width: ${({ theme }) =>
          `${theme.sizes.startMenu.size - theme.sizes.startMenu.sideBar.width - THIN_SCROLLBAR_WIDTH_NON_WEBKIT}px`};
      }
    }

    ${StyledFileManager} {
      margin: 0;
      overflow: hidden;
      padding: 0;
      scrollbar-gutter: auto;

      figure {
        picture {
          margin-left: 11px;
        }

        &:active {
          picture {
            margin-left: 15px;
          }
        }

        picture,
        svg {
          transition: none;
        }
      }
    }

    @supports not selector(::-webkit-scrollbar) {
      scrollbar-width: ${({ $showScrolling }) =>
        $showScrolling ? "thin" : "none"};
    }

    &::-webkit-scrollbar {
      width: ${({ $showScrolling }) =>
        $showScrolling ? THIN_SCROLLBAR_WIDTH : 0}px;
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
        $showScrolling ? undefined : "rgb(167, 167, 167)"};
    }
  }
`;

export default StyledStartMenu;
