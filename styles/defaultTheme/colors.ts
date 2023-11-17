const colors = {
  background: "#282828",
  fileEntry: {
    background: "hsla(183, 33%, 40%, 25%)",
    backgroundFocused: "hsla(157, 16%, 58%, 35%)",
    backgroundFocusedHover: "hsla(207, 90%, 72%, 30%)",
    border: "hsla(183, 33%, 40%, 30%)",
    borderFocused: "hsla(157, 16%, 58%, 35%)",
    borderFocusedHover: "hsla(207, 90%, 72%, 40%)",
    text: "#fbf1c7",
    textShadow: `
      0 0 1px rgba(0, 0, 0, 75%),
      0 0 2px rgba(0, 0, 0, 50%),

      0 1px 1px rgba(0, 0, 0, 75%),
      0 1px 2px rgba(0, 0, 0, 50%),

      0 2px 1px rgba(0, 0, 0, 75%),
      0 2px 2px rgba(0, 0, 0, 50%)`,
  },
  highlight: "hsla(157, 16%, 58%, 90%)",
  highlightBackground: "hsla(157, 16%, 58%, 20%)",
  progress: "hsla(61, 66%, 44%, 90%)",
  progressBackground: "hsla(60, 71%, 35%, 70%)",
  progressBarRgb: "rgb(184, 187, 38)",
  startButton: "#fbf1c7",
  taskbar: {
    active: "hsla(0, 0%, 20%, 70%)",
    activeForeground: "hsla(0, 0%, 40%, 70%)",
    background: "hsla(0, 0%, 10%, 70%)",
    button: {
      color: "#fbf1c7",
    },
    foreground: "hsla(0, 0%, 35%, 70%)",
    foregroundHover: "hsla(0, 0%, 45%, 70%)",
    foregroundProgress: "hsla(104, 22%, 45%, 30%)",
    hover: "hsla(0, 0%, 25%, 70%)",
    peekBorder: "hsla(0, 0%, 50%, 50%)",
  },
  text: "rgba(251, 241, 199, 90%)",
  titleBar: {
    background: "rgb(40, 40, 40)",
    backgroundHover: "rgb(80, 73, 69)",
    backgroundInactive: "rgb(50, 48, 47)",
    buttonInactive: "rgb(146, 131, 116)",
    closeHover: "rgb(251, 73, 52)",
    text: "rgb(251, 241, 199)",
    textInactive: "rgb(168, 153, 132)",
  },
  window: {
    background: "#928374",
    outline: "hsla(0, 0%, 25%, 75%)",
    outlineInactive: "hsla(0, 0%, 30%, 100%)",
    shadow: "0 0 12px 0 rgba(0, 0, 0, 50%)",
    shadowInactive: "0 0 8px 0 rgba(0, 0, 0, 50%)",
  },
};

export default colors;
