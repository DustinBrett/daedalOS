# TODO

### MVP Bugs

- Window: Post-minimize forces re-render
  - Have `minimize` change visibility, not be filtered
- Taskbar: Hovering/selecting is resizing the entries on mobile
  - Redo the padding/margin logic for taskbar entries
- Winamp: Can't drag on equalizer
  - Add Equalizer components to `cancel` list

#### Post-MVP Bugs

- DOS: Closing window doesn't fully kill DOS
  - Upgrade to js-dos v7
- Winamp: Focus isn't reliable on mobile
- Winamp: Clicking taskbar entry does not focus app
- Winamp: Right click menu is not working
- Window: Dragging on mobile sometimes triggers resize

### MVP Features

- Document: Favicon
- Icons: Draggable
- Icons: Loading indicator
- Window: Reveal min/max/close when hovering any
- Window: Maximize (Maintain aspect ratio)
- Window: Make titlebar text reactive

#### Post-MVP Features

- DOS: Close app when `EXIT` is typed
- DOS: Loading screen until app is running
- DOS: Virtual keyboard on mobile
- Winamp: Milkdrop (https://github.com/jberg/butterchurn)

### Code Quality

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
- Volume Controls (https://github.com/Tonejs/unmute)
- Clippy.JS (https://www.smore.com/clippy-js)
- Photo Viewer
- Calendar
- Session Management
- PWA
- i18n support
- Minesweeper (https://github.com/ziebelje/minesweeper)
