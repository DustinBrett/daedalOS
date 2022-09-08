import type { FlattenSimpleInterpolation } from "styled-components";
import { css } from "styled-components";
import { DOWN, LEFT, RIGHT, UP } from "styles/ArrowIcons";

const ScrollBars = (
  size: number,
  verticalX?: number,
  verticalY?: number
): FlattenSimpleInterpolation => css`
  overflow: auto;
  scrollbar-color: rgb(77, 77, 77) rgb(23, 23, 23);
  scrollbar-gutter: stable;

  ::-webkit-scrollbar {
    height: ${size}px;
    width: ${size}px;
  }

  ::-webkit-scrollbar-corner,
  ::-webkit-scrollbar-track {
    background-color: rgb(23, 23, 23);
  }

  ::-webkit-scrollbar-thumb {
    background-clip: padding-box;
    background-color: rgb(77, 77, 77);
  }

  ::-webkit-scrollbar-thumb:vertical {
    background-clip: padding-box;
    background-color: rgb(77, 77, 77);
    border-left: 1px solid transparent;
    border-right: 1px solid transparent;
  }

  ::-webkit-scrollbar-thumb:horizontal {
    border-bottom: 1px solid transparent;
    border-top: 1px solid transparent;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: rgb(122, 122, 122);
  }

  ::-webkit-scrollbar-thumb:active {
    background-color: rgb(166, 166, 166);
  }

  ::-webkit-scrollbar-button:single-button {
    background-clip: padding-box;
    background-color: rgb(23, 23, 23);
    background-position: center 4px;
    background-repeat: no-repeat;
    background-size: 10px;
    border: 1px solid rgb(23, 23, 23);
    display: block;
    height: ${size ? `${size}px` : "initial"};

    &:hover {
      background-color: rgb(55, 55, 55);
    }

    &:active {
      background-color: rgb(166, 166, 166);
    }
  }

  ::-webkit-scrollbar-button:single-button:vertical:decrement,
  ::-webkit-scrollbar-button:single-button:vertical:increment {
    background-position-x: ${verticalX ? `${verticalX}px` : "center"};
    background-position-y: ${verticalY ? `${verticalY}px` : "center"};
    background-size: 16px;
    border-bottom: 0;
    border-top: 0;
    image-rendering: pixelated;
  }

  ::-webkit-scrollbar-button:single-button:vertical:decrement {
    background-image: url(${UP});
  }

  ::-webkit-scrollbar-button:single-button:vertical:increment {
    background-image: url(${DOWN});
  }

  ::-webkit-scrollbar-button:single-button:horizontal:decrement,
  ::-webkit-scrollbar-button:single-button:horizontal:increment {
    background-position: center;
    background-size: 16px;
    border-left: 0;
    border-right: 0;
    image-rendering: pixelated;
  }

  ::-webkit-scrollbar-button:single-button:horizontal:decrement {
    background-image: url(${LEFT});
  }

  ::-webkit-scrollbar-button:single-button:horizontal:increment {
    background-image: url(${RIGHT});
  }

  ::-webkit-scrollbar-button:single-button:vertical:decrement:active,
  ::-webkit-scrollbar-button:single-button:vertical:increment:active,
  ::-webkit-scrollbar-button:single-button:horizontal:decrement:active,
  ::-webkit-scrollbar-button:single-button:horizontal:increment:active {
    background-blend-mode: color-burn;
  }
`;

export default ScrollBars;
