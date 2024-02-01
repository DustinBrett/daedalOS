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
    active: "rgb(166, 166, 166)",
    blendMode: "color-burn",
    buttonHover: "rgb(55, 55, 55)",
    thumb: "rgb(77, 77, 77)",
    thumbHover: "rgb(122, 122, 122)",
    track: "rgb(23, 23, 23)",
  },
  light: {
    active: "rgb(96, 96, 96)",
    blendMode: "color-dodge",
    buttonHover: "rgb(218, 218, 218)",
    thumb: "rgb(205, 205, 205)",
    thumbHover: "rgb(166, 166, 166)",
    track: "rgb(240, 240, 240)",
  },
};

const ScrollBars = (
  size = DEFAULT_SCROLLBAR_WIDTH,
  verticalX = 0,
  verticalY = 0,
  scheme: ColorSchemes = "dark"
): RuleSet<object> => css`
  overflow: auto;
  scrollbar-gutter: stable;

  @supports not selector(::-webkit-scrollbar) {
    scrollbar-color: ${colorScheme[scheme].thumb} ${colorScheme[scheme].track};
  }

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
