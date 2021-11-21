import StyledFileManager from "components/system/Files/Views/List/StyledFileManager";
import { motion } from "framer-motion";
import styled from "styled-components";
import ScrollBars from "styles/common/ScrollBars";

const StyledStartMenu = styled(motion.nav)`
  background-color: hsla(0, 0%, 13%, 70%);
  bottom: ${({ theme }) => theme.sizes.taskbar.height};
  box-shadow: 3px 0 10px 3px hsla(0, 0%, 10%, 50%);
  contain: strict;
  display: flex;
  height: ${({ theme }) => theme.sizes.startMenu.size};
  left: 0;
  position: absolute;
  width: ${({ theme }) => theme.sizes.startMenu.size};
  z-index: 1000;

  ${StyledFileManager} {
    ${ScrollBars(13, -2, -1)};

    margin-top: 0;
    padding-left: ${({ theme }) => theme.sizes.startMenu.sideBar.width};
    padding-top: 7px;

    &:not(:hover) {
      ::-webkit-scrollbar {
        width: 1px;
      }

      ::-webkit-scrollbar-corner,
      ::-webkit-scrollbar-track {
        background-color: transparent;
      }

      ::-webkit-scrollbar-button:single-button {
        background-color: transparent;
        border: 1px solid transparent;
      }

      ::-webkit-scrollbar-thumb {
        background-color: rgb(170, 170, 170);
      }
    }
  }
`;

export default StyledStartMenu;
