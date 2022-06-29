import StyledFileManager from "components/system/Files/Views/List/StyledFileManager";
import { m as motion } from "framer-motion";
import styled, { css } from "styled-components";
import ScrollBars from "styles/common/ScrollBars";
import { THIN_SCROLLBAR_WIDTH } from "utils/constants";

type StyledStartMenuProps = {
  $showScrolling: boolean;
};

const HOVER_ADJUSTED_PADDING = THIN_SCROLLBAR_WIDTH - 3;

const ThinScrollBars = css<StyledStartMenuProps>`
  ::-webkit-scrollbar {
    width: ${({ $showScrolling }) =>
      $showScrolling ? `${THIN_SCROLLBAR_WIDTH}px` : "3px"};
  }

  ::-webkit-scrollbar-corner,
  ::-webkit-scrollbar-track {
    background-color: ${({ $showScrolling }) =>
      !$showScrolling && "transparent"};
  }

  ::-webkit-scrollbar-button:single-button {
    background-color: ${({ $showScrolling }) =>
      !$showScrolling && "transparent"};
    border: ${({ $showScrolling }) =>
      !$showScrolling && "1px solid transparent"};
  }

  ::-webkit-scrollbar-thumb:vertical {
    background-color: ${({ $showScrolling }) =>
      !$showScrolling && "rgb(167, 167, 167)"};
  }
`;

const StyledStartMenu = styled(motion.nav)<StyledStartMenuProps>`
  background-color: hsla(0, 0%, 13%, 95%);
  bottom: ${({ theme }) => theme.sizes.taskbar.height};
  box-shadow: 3px 0 10px 3px hsla(0, 0%, 10%, 50%);
  contain: strict;
  display: flex;
  height: 100%;
  left: 0;
  max-height: ${({ theme }) => theme.sizes.startMenu.maxHeight};
  max-width: ${({ theme }) => theme.sizes.startMenu.size};
  min-height: ${({ theme }) => theme.sizes.startMenu.size};
  position: absolute;
  width: 100%;
  z-index: 1000;

  @supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
    background-color: hsla(0, 0%, 13%, 70%);
  }

  ${StyledFileManager} {
    ${ScrollBars(THIN_SCROLLBAR_WIDTH, -2, -1)};

    margin-top: 0;
    padding-left: ${({ theme }) => theme.sizes.startMenu.sideBar.width};
    padding-right: ${THIN_SCROLLBAR_WIDTH}px;
    padding-top: 7px;
    scrollbar-width: none;

    ${StyledFileManager} {
      margin: 0;
      overflow: hidden;
      padding: 0;

      figure {
        img {
          margin-left: 9px;
        }

        &:active {
          img {
            margin-left: 13px;
          }
        }
      }
    }

    ::-webkit-scrollbar {
      width: 0;
    }

    &:hover {
      ${ThinScrollBars};
      padding-right: ${({ $showScrolling }) =>
        !$showScrolling ? `${HOVER_ADJUSTED_PADDING}px` : 0};

      @supports (scrollbar-width: thin) {
        padding-right: 5px;
        scrollbar-width: thin;
      }
    }

    @media (hover: none), (pointer: coarse) {
      ${ThinScrollBars};

      ::-webkit-scrollbar-track {
        margin: 13px 0;
      }
    }
  }
`;

export default StyledStartMenu;
