# TODO

### Bugs
- DOS: Closing window doesn't fully kill DOS
- DOS: Clicking `<canvas>` is not focusing on window
- Taskbar: Min-width can't fit 5 items on mobile
- Taskbar: Hovering/selecting is resizing the entries on mobile
- Winamp: Focus isn't reliable on mobile
- Winamp: Clicking taskbar entry does not focus app
- Winamp: Right click menu is not working
- Winamp: Can't drag on equalizer
- Window: Post-minimize forces re-render
- Window: Cascading is not working properly in all cases
- Window: Dragging on mobile sometimes triggers resize

### Features
- Document: Favicon
- DOS: Loading screen until app is running
- DOS: Close app when `EXIT` is typed
- DOS: Virtual keyboard on mobile
- Icons: Draggable
- Icons: Loading indicator
- Winamp: Milkdrop (https://github.com/jberg/butterchurn)
- Window: Maximize (Maintain aspect ratio)
- Window: Make titlebar text reactive
- Window: Reveal min/max/close when hovering any

### Code
- Document: Fix tabindex (https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex)
- Winamp: Position logic (`x|y / 2`) is messy
- Window: Avoid storing `stackOrder` in every app
- Window: Remove hard coded z-index

# FUTURE

- Animations (https://www.framer.com/api/motion)
- File Explorer (https://github.com/jvilk/BrowserFS)
- Word Processor (https://webodf.org/)
- React-Use (https://github.com/streamich/react-use)
  - useBattery, useIdle, useLongPress, useMediaDevices, useNetwork
- PDF.js (https://github.com/mozilla/pdf.js)
- JS Paint (https://github.com/1j01/jspaint)
- Code Editor (https://codemirror.net/)
- Terminal (https://xtermjs.org/)
- System Tray
- Volume Controls
- Clippy.JS (https://www.smore.com/clippy-js)
- Photo Viewer
- Calendar
- Session Management
- PWA
- i18n support
- Minesweeper (https://github.com/ziebelje/minesweeper)
