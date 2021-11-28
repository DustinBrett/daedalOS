import StyledFileManager from "components/system/Files/Views/List/StyledFileManager";
import { motion } from "framer-motion";
import styled, { css } from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const SCROLLBAR_WIDTH = 13;

type StyledStartMenuProps = {
  $showScrolling: boolean;
};

const ThinScrollBars = css<StyledStartMenuProps>`
  ::-webkit-scrollbar {
    width: ${({ $showScrolling }) =>
      $showScrolling ? `${SCROLLBAR_WIDTH}px` : "1px"};
  }

  ::-webkit-scrollbar-corner,
  ::-webkit-scrollbar-track {
    background-color: ${({ $showScrolling }) =>
      !$showScrolling && "transparent"};
  }

  ::-webkit-scrollbar-button:single-button {
    border: ${({ $showScrolling }) =>
      !$showScrolling && "1px solid transparent"};
    background-color: ${({ $showScrolling }) =>
      !$showScrolling && "transparent"};
  }

  ::-webkit-scrollbar-thumb:vertical {
    background-color: ${({ $showScrolling }) =>
      !$showScrolling && "rgb(170, 170, 170)"};
  }
`;

const StyledStartMenu = styled(motion.nav)<StyledStartMenuProps>`
  position: absolute;
  z-index: 1000;
  bottom: ${({ theme }) => theme.sizes.taskbar.height};
  left: 0;
  display: flex;
  width: ${({ theme }) => theme.sizes.startMenu.size};
  height: ${({ theme }) => theme.sizes.startMenu.size};
  background-color: hsla(0, 0%, 13%, 70%);
  box-shadow: 3px 0 10px 3px hsla(0, 0%, 10%, 50%);
  contain: strict;

  ${StyledFileManager} {
    ${ScrollBars(SCROLLBAR_WIDTH, -2, -1)};

    padding-top: 7px;
    padding-left: ${({ theme }) => theme.sizes.startMenu.sideBar.width};
    margin-top: 0;

    ${StyledFileManager} {
      overflow: hidden;
      padding: 0;
      margin: 0;

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
    }

    @media (hover: none) {
      ${ThinScrollBars};

      ::-webkit-scrollbar-track {
        margin: 13px 0;
      }
    }
  }
`;

export default StyledStartMenu;
