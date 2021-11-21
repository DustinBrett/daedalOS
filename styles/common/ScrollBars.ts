import type { FlattenSimpleInterpolation } from "styled-components";
import { css } from "styled-components";

const ScrollBars = (
  size: number,
  verticalX?: number,
  verticalY?: number
): FlattenSimpleInterpolation => css`
  overflow: auto;

  ::-webkit-scrollbar {
    width: ${size}px;
    height: ${size}px;
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
    border-right: 1px solid transparent;
    border-left: 1px solid transparent;
    background-clip: padding-box;
    background-color: rgb(77, 77, 77);
  }

  ::-webkit-scrollbar-thumb:horizontal {
    border-top: 1px solid transparent;
    border-bottom: 1px solid transparent;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: rgb(122, 122, 122);
  }

  ::-webkit-scrollbar-thumb:active {
    background-color: rgb(166, 166, 166);
  }

  ::-webkit-scrollbar-button:single-button {
    display: block;
    height: ${size ? `${size}px` : "initial"};
    border: 1px solid rgb(23, 23, 23);
    background-clip: padding-box;
    background-color: rgb(23, 23, 23);
    background-position: center 4px;
    background-repeat: no-repeat;
    background-size: 10px;

    &:hover {
      background-color: rgb(55, 55, 55);
    }

    &:active {
      background-color: rgb(166, 166, 166);
    }
  }

  ::-webkit-scrollbar-button:single-button:vertical:decrement,
  ::-webkit-scrollbar-button:single-button:vertical:increment {
    border-top: 0;
    border-bottom: 0;
    background-position-x: ${verticalX ? `${verticalX}px` : "center"};
    background-position-y: ${verticalY ? `${verticalY}px` : "center"};
    background-size: 16px;
    image-rendering: pixelated;
  }

  ::-webkit-scrollbar-button:single-button:vertical:decrement {
    background-image: url("/System/Icons/16x16/up.png");
  }

  ::-webkit-scrollbar-button:single-button:vertical:increment {
    background-image: url("/System/Icons/16x16/down.png");
  }

  ::-webkit-scrollbar-button:single-button:horizontal:decrement,
  ::-webkit-scrollbar-button:single-button:horizontal:increment {
    border-right: 0;
    border-left: 0;
    background-position: center;
    background-size: 16px;
    image-rendering: pixelated;
  }

  ::-webkit-scrollbar-button:single-button:horizontal:decrement {
    background-image: url("/System/Icons/16x16/left.png");
  }

  ::-webkit-scrollbar-button:single-button:horizontal:increment {
    background-image: url("/System/Icons/16x16/right.png");
  }

  ::-webkit-scrollbar-button:single-button:vertical:decrement:active,
  ::-webkit-scrollbar-button:single-button:vertical:increment:active,
  ::-webkit-scrollbar-button:single-button:horizontal:decrement:active,
  ::-webkit-scrollbar-button:single-button:horizontal:increment:active {
    background-blend-mode: color-burn;
  }
`;

export default ScrollBars;
