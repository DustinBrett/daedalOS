import type { DefaultTheme } from "styled-components";
import defaultTheme from "styles/defaultTheme";

const kumavisTheme: DefaultTheme = {
  ...defaultTheme,
  sizes: {
    ...defaultTheme.sizes,
    fileExplorer: {
      ...defaultTheme.sizes.fileExplorer,
    },
  },
  colors: {
    ...defaultTheme.colors,
    fileEntry: {
      ...defaultTheme.colors.fileEntry,

      // background: "hsla(207, 30%, 72%, 25%)",
      // border: "hsla(207, 30%, 72%, 30%)",

      // backgroundFocused: "hsla(207, 60%, 72%, 35%)",
      // borderFocused: "hsla(207, 60%, 72%, 35%)",
      backgroundFocused: "rgba(32, 32, 32, 20%)",
      borderFocused: "rgba(32, 32, 32, 20%)",

      // backgroundFocusedHover: "hsla(207, 90%, 72%, 30%)",
      // borderFocusedHover: "hsla(207, 90%, 72%, 40%)",
      backgroundFocusedHover: "rgba(64, 64, 64, 30%)",
      borderFocusedHover: "rgba(64, 64, 64, 40%)",
    },
    fileExplorer: {
      ...defaultTheme.colors.fileExplorer,
      backdropFilter: "blur(10px)",
    },
    highlight: "rgba(32, 32, 32, 90%)",
    highlightBackground: "rgba(32, 32, 32, 20%)",
  },
  name: "kumavis",
};

export default kumavisTheme;
