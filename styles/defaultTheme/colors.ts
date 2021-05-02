const colors = {
  background: '#000',
  fileEntry: {
    background: `hsl(207deg 30% 72% / 25%)`,
    backgroundFocused: `hsl(207deg 60% 72% / 30%)`,
    backgroundFocusedHover: `hsl(207deg 90% 72% / 35%)`,
    border: 'hsl(207deg 30% 72% / 30%)',
    borderFocused: 'hsl(207deg 60% 72% / 35%)',
    borderFocusedHover: 'hsl(207deg 90% 72% / 40%)',
    text: '#FFF',
    textShadow: `
      0 0 1px rgba(0, 0, 0, 75%),
      0 0 2px rgba(0, 0, 0, 50%),
      0 0 3px rgba(0, 0, 0, 25%),

      0 1px 1px rgba(0, 0, 0, 75%),
      0 1px 2px rgba(0, 0, 0, 50%),
      0 1px 3px rgba(0, 0, 0, 25%),

      0 2px 1px rgba(0, 0, 0, 75%),
      0 2px 2px rgba(0, 0, 0, 50%),
      0 2px 3px rgba(0, 0, 0, 25%)`
  },
  highlight: 'hsl(207deg 100% 72% / 90%)',
  startButton: '#FFF',
  taskbar: {
    active: 'hsla(0, 0%, 35%, 70%)',
    activeHover: 'hsla(0, 0%, 45%, 70%)',
    background: 'hsla(0, 0%, 10%, 70%)',
    hover: 'hsla(0, 0%, 25%, 70%)'
  },
  text: 'rgba(255, 255, 255, 90%)',
  titleBar: {
    background: 'rgb(0, 0, 0)',
    backgroundHover: 'rgb(26, 26, 26)',
    backgroundInactive: 'rgb(43, 43, 43)',
    buttonInactive: 'rgb(128, 128, 128)',
    closeHover: 'rgb(232, 17, 35)',
    text: 'rgb(255, 255, 255)',
    textInactive: 'rgb(170, 170, 170)'
  },
  window: {
    background: '#808080',
    outline: 'hsl(0deg 0% 25% / 75%)',
    outlineInactive: 'hsl(0deg 0% 30% / 75%)',
    shadow: '0 0 12px 0 rgba(0, 0, 0, 50%)',
    shadowInactive: '0 0 8px 0 rgba(0, 0, 0, 50%)'
  }
};

export default colors;
