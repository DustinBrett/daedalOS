import { motion } from "framer-motion";
import styled from "styled-components";

type StyledMenuProps = {
  $isSubMenu: boolean;
  $x: number;
  $y: number;
};

const StyledMenu = styled(motion.nav)<StyledMenuProps>`
  position: absolute;
  z-index: ${({ $isSubMenu }) => $isSubMenu && 1};
  width: fit-content;
  height: fit-content;
  padding: 4px 2px;
  border: 1px solid rgb(160, 160, 160);
  background-color: rgb(43, 43, 43);
  box-shadow: 1px 1px 1px hsla(0, 0%, 20%, 70%),
    2px 2px 2px hsla(0, 0%, 10%, 70%);
  color: rgb(255, 255, 255);
  contain: layout;
  font-size: 12px;
  transform: ${({ $x, $y }) => `translate(${$x}px, ${$y}px);`};

  ol {
    li.disabled {
      color: rgb(110, 110, 110);
      pointer-events: none;
    }

    hr {
      height: 1px;
      margin: 3px 8px;
      background-color: rgb(128, 128, 128);
    }

    figure {
      display: flex;
      padding: 3px 0;

      &:hover,
      &.active {
        background-color: rgb(65, 65, 65);
      }

      figcaption {
        position: relative;
        top: -1px;
        width: max-content;
        margin-right: 64px;
        margin-left: 32px;

        &.primary {
          font-weight: 700;
        }
      }

      img {
        margin: 0 -24px 0 8px;
      }

      svg {
        position: absolute;
        width: 13px;
        height: 13px;
        margin-top: 1px;
        fill: #fff;

        &.left {
          left: 8px;
        }

        &.right {
          right: 8px;
        }
      }
    }
  }
`;

export default StyledMenu;
