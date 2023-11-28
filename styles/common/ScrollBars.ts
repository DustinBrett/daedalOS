import { type RuleSet, css } from "styled-components";
import { DOWN, LEFT, RIGHT, UP } from "styles/ArrowIcons";
import { DEFAULT_SCROLLBAR_WIDTH } from "utils/constants";

type ColorSchemes = "dark" | "light";

type ColorScheme = {
  active: string;
  blendMode: string;
  buttonHover: string;
  thumb: string;
  thumbHover: string;
  track: string;
};

const colorScheme: Record<ColorSchemes, ColorScheme> = {
  dark: {
    active: "rgb(146,131,116)",
    blendMode: "color-burn",
    buttonHover: "rgb(50,48,47)",
    thumb: "rgb(60,56,54)",
    thumbHover: "rgb(124,111,100)",
    track: "rgb(40,40,40)",
  },
  light: {
    active: "rgb(102,92,84)",
    blendMode: "color-dodge",
    buttonHover: "rgb(235,219,178)",
    thumb: "rgb(213,196,161)",
    thumbHover: "rgb(189,174,147)",
    track: "rgb(251,241,199)",
  },
};

const ScrollBars = (
  size = DEFAULT_SCROLLBAR_WIDTH,
  verticalX = 0,
  verticalY = 0,
  scheme: ColorSchemes = "dark"
): RuleSet<object> => css`
  overflow: auto;
  scrollbar-color: ${colorScheme[scheme].thumb} ${colorScheme[scheme].track};
  scrollbar-gutter: stable;

  &::-webkit-scrollbar {
    height: ${size}px;
    width: ${size}px;
  }

  &::-webkit-scrollbar-corner,
  &::-webkit-scrollbar-track {
    background-color: ${colorScheme[scheme].track};
  }

  &::-webkit-scrollbar-thumb {
    background-clip: padding-box;
    background-color: ${colorScheme[scheme].thumb};
  }

  &::-webkit-scrollbar-thumb:vertical {
    background-clip: padding-box;
    background-color: ${colorScheme[scheme].thumb};
    border-left: 1px solid transparent;
    border-right: 1px solid transparent;
  }

  &::-webkit-scrollbar-thumb:horizontal {
    border-bottom: 1px solid transparent;
    border-top: 1px solid transparent;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: ${colorScheme[scheme].thumbHover};
  }

  &::-webkit-scrollbar-thumb:active {
    background-color: ${colorScheme[scheme].active};
  }

  &::-webkit-scrollbar-button:single-button {
    background-clip: padding-box;
    background-color: ${colorScheme[scheme].track};
    background-position: center 4px;
    background-repeat: no-repeat;
    background-size: 10px;
    border: 1px solid ${colorScheme[scheme].track};
    display: block;
    height: ${size ? `${size}px` : "initial"};

    &:hover {
      background-color: ${colorScheme[scheme].buttonHover};
    }

    &:active {
      background-color: ${colorScheme[scheme].active};
    }
  }

  &::-webkit-scrollbar-button:single-button:vertical:decrement,
  &::-webkit-scrollbar-button:single-button:vertical:increment {
    background-position-x: ${verticalX === 0 ? "center" : `${verticalX}px`};
    background-position-y: ${verticalY === 0 ? "center" : `${verticalY}px`};
    background-size: 16px;
    border-bottom: 0;
    border-top: 0;
    image-rendering: pixelated;
  }

  &::-webkit-scrollbar-button:single-button:vertical:decrement {
    background-image: url(${UP});
  }

  &::-webkit-scrollbar-button:single-button:vertical:increment {
    background-image: url(${DOWN});
  }

  &::-webkit-scrollbar-button:single-button:horizontal:decrement,
  &::-webkit-scrollbar-button:single-button:horizontal:increment {
    background-position: center;
    background-size: 16px;
    border-left: 0;
    border-right: 0;
    image-rendering: pixelated;
  }

  &::-webkit-scrollbar-button:single-button:horizontal:decrement {
    background-image: url(${LEFT});
  }

  &::-webkit-scrollbar-button:single-button:horizontal:increment {
    background-image: url(${RIGHT});
  }

  &::-webkit-scrollbar-button:single-button:vertical:decrement:active,
  &::-webkit-scrollbar-button:single-button:vertical:increment:active,
  &::-webkit-scrollbar-button:single-button:horizontal:decrement:active,
  &::-webkit-scrollbar-button:single-button:horizontal:increment:active {
    background-blend-mode: ${colorScheme[scheme].blendMode};
  }
`;

export default ScrollBars;
