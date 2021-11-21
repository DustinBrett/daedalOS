import StyledFileManager from "components/system/Files/Views/List/StyledFileManager";
import { motion } from "framer-motion";
import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledStartMenu = styled(motion.nav)`
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
    ${ScrollBars(13, -2, -1)};

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

    &:not(:hover) {
      ::-webkit-scrollbar {
        width: 1px;
      }

      ::-webkit-scrollbar-corner,
      ::-webkit-scrollbar-track {
        background-color: transparent;
      }

      ::-webkit-scrollbar-button:single-button {
        border: 1px solid transparent;
        background-color: transparent;
      }

      ::-webkit-scrollbar-thumb {
        background-color: rgb(170, 170, 170);
      }
    }
  }
`;

export default StyledStartMenu;
