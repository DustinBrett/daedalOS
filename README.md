# TODO

### MVP Bugs

- Taskbar: Clicking recently focused entry is minimizing it
- DOS: Can't touch to click active games

### MVP Features

- Icons: Draggable
- Window: Reveal min/max/close when hovering any
- Window: Maximize

### MVP Explorer Tweaks

- Scrolling inside `<tbody>`
- Unselect line when clicking outside table
  - Grey instead of blue if clicking outside window
- `.ico` files can use themselves for their icon
- Alternating colors should continue to bottom

### MVP Explorer Features

- Open apps via clicking files
- Status bar with totals
- Back/Forward buttons
- Path bar

#### Post-MVP Bugs

- General: Restructure the apps to work with the "file system"
- DOS: Closing window doesn't fully kill DOS
  - Upgrade to js-dos v7
- Winamp: Focus isn't reliable on mobile
- Winamp: Clicking taskbar entry does not focus app
- Window: Better solution to bottom corners showing bg color

#### Post-MVP Features

- Icons: Loading indicator
- Icons: Icon component which takes `.ico` files and can store multiple sizes
- Window: Open at a size/position relative to the viewport, orientation & resolution
- Window: Add drag constraint to top
- DOS: Close app when `EXIT` is typed
- DOS: Virtual keyboard on mobile
- Winamp: Milkdrop (https://github.com/jberg/butterchurn)
- Winamp: Load faster
  - Skin request/decompress, x-win-bitmap requests, pre-loaded mp3
- General: URL Routing to apps/files
- Explorer: Link with JS-DOS storage
- Explorer: Delete/Create/Drag/Drop files
- Explorer: Search files
- Explorer: Resizie column headers
- Explorer: Get modified time from files

### Code Quality

- Document: Fix tabindex (https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex)
- Winamp: Position logic (`x|y / 2`) is messy
- Window: Avoid storing `stackOrder` in every app
- Window: Remove hard coded z-index
- General: Create `.d.ts` files for TS declares
- Uses classes when possible to avoid collisions

# FUTURE

- Animations (https://www.framer.com/api/motion)
- Word Processor (https://webodf.org/)
- React-Use (https://github.com/streamich/react-use)
  - useBattery, useIdle, useLongPress, useMediaDevices, useNetwork
- PDF.js (https://github.com/mozilla/pdf.js)
- JS Paint (https://github.com/1j01/jspaint)
- Code Editor (https://codemirror.net/, https://ace.c9.io/)
- Terminal (https://xtermjs.org/)
- Volume Controls (https://github.com/Tonejs/unmute)
- Clippy.JS (https://www.smore.com/clippy-js)
- Minesweeper (https://github.com/ziebelje/minesweeper)
- IRC Client (https://thelounge.chat/)
- Spreadsheet Editor (https://myliang.github.io/x-spreadsheet)
- System Tray
- Photo Viewer
- Calendar
