# MVP-hard

## System

- Windows
  - Animate min/max w/Framer
  - Animate enter/exit with scale/spring instead of fade
  - Double check colors and sizes (Digital Color Meter)
  - Fix background white/transparent/corner issue
  - Size opening/positioning logic
    - Relative to the viewport, orientation & resolution
    - Pre-define ideal min sizes for windows
- Icons
  - Image optimization (WebP & responsive)
  - Double check colors and sizes (Digital Color Meter)
  - Horizontal rendering issues with mixed 1-2 line icon labels
- Taskbar
  - Clicking recently focused entry is minimizing it

## Apps

- PDF
  - Page back/fwd, zoom in/out/drop-down, print, download
  - Style like a mix of PDF.js, Chrome PDF & Adobe Reader
- Explorer
  - Title change to current folder
  - Breadcrumb bar
  - Item count / status bar
  - Faster select highlighting (via onFocus)
  - Stay highlighted but grey when window is unfocused
  - Resizable columns
  - Limit scroll viewport to list view
  - File type icons
  - Search bar
- Document Viewer for Blog (https://webodf.org/)
- DOS
  - Optional mouse lock
  - Clicking canvas focus mobile
- Clippy.JS (https://www.smore.com/clippy-js)

## Data

- Blog posts as docs

# MVP-soft

- JS Paint (https://github.com/1j01/jspaint)
- HoMM2
- System Tray: React-Use (https://github.com/streamich/react-use)
  - useBattery, useIdle, useLongPress, useMediaDevices, useNetwork
  - useIdle + Pipes (https://github.com/1j01/pipes)
- Start Menu

# Post-MVP

- next-optimized-images
- next-secure-headers
- URL Routing to apps/files
- Icon text un-truncate on selection (Don't truncate icons for now)
- Winamp
  - Clicking taskbar entry does not focus app
  - Focus isn't reliable on mobile
  - Milkdrop (https://github.com/jberg/butterchurn)
  - Position logic (x|y / 2) is messy
- Window
  - Top drag constraints
  - Avoid storing stackOrder in every app
  - Remove hard coded z-index
- DOS
  - Close app when EXIT is typed
  - Virtual keyboard on mobile
- Explorer
  - Link with JS-DOS storage
  - Delete/Create/Drag/Drop files
- Fix tabindex (https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex)

# Ideas

- Code Editor (https://codemirror.net/, https://ace.c9.io/)
- Terminal (https://xtermjs.org/, https://github.com/jcubic/git)
- Volume Controls (https://github.com/Tonejs/unmute)
- Minesweeper (https://github.com/ziebelje/minesweeper)
- IRC Client (https://thelounge.chat/)
  - https://github.com/gummipunkt/thelounge_theme_mircalike
- Spreadsheet Editor (https://myliang.github.io/x-spreadsheet)
- Photo Viewer
- Calendar
- Right click menus
- Light/dark theme/modes
