import { m as motion } from "motion/react";
import styled from "styled-components";

type StyledMenuProps = {
  $isSubMenu: boolean;
  $x: number;
  $y: number;
};

const StyledMenu = styled(motion.nav).attrs<StyledMenuProps>(({ $x, $y }) => ({
  style: {
    transform: `translate(${$x}px, ${$y}px)`,
  },
}))<StyledMenuProps>`
  background-color: rgb(43 43 43);
  border: 1px solid rgb(160 160 160);
  box-shadow:
    1px 1px 1px hsl(0 0% 20% / 70%),
    2px 2px 2px hsl(0 0% 10% / 70%);
  color: rgb(255 255 255);
  contain: layout;
  font-size: 12px;
  max-height: fit-content;
  max-width: fit-content;
  padding: 4px 2px;
  pointer-events: none;
  position: fixed;
  width: max-content;
  z-index: ${({ $isSubMenu }) => $isSubMenu && 1};

  ol {
    pointer-events: all;

    li.disabled {
      color: rgb(110 110 110);
      pointer-events: none;
    }

    hr {
      background-color: rgb(128 128 128);
      height: 1px;
      margin: 3px 8px;
    }

    li > div {
      display: flex;
      padding: 3px 0;

      &:hover,
      &.active {
        background-color: rgb(65 65 65);
      }

      figcaption {
        display: flex;
        height: 16px;
        line-height: 16px;
        margin-left: 32px;
        margin-right: 64px;
        place-items: center;
        position: relative;
        top: -1px;
        white-space: nowrap;
        width: max-content;

        &.primary {
          font-weight: 700;
        }
      }

      picture {
        margin: 0 -24px 0 8px;
      }

      span {
        margin: -1px -24px 0 8px;
      }

      svg {
        fill: #fff;
        height: 13px;
        margin-top: 1px;
        position: absolute;
        width: 13px;

        &.left {
          left: 8px;
        }

        &.right {
          right: 8px;
        }
      }

      .icon > svg {
        height: 15px;
        left: 10px;
        width: 15px;
      }
    }
  }
`;

export default StyledMenu;
