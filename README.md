# MVP

## System

- Double check colors and sizes (Digital Color Meter)
- Windows
  - Animate min/max/enter/exit with framer (fix z-index)
  - Size opening/positioning logic
    - Relative to the viewport, orientation & resolution
    - Pre-define ideal min sizes for windows
  - Fix semantic HTML (https://www.w3.org/wiki/HTML/Usage/Headings/Missing)
- Icons
  - Horizontal rendering issues with mixed 1-2 line icon labels
- Taskbar
  - Clicking recently focused entry is minimizing it
- System Tray: React-Use (https://github.com/streamich/react-use)
  - useBattery, useIdle, useLongPress, useMediaDevices, useNetwork
  - useIdle + Pipes (https://github.com/1j01/pipes)

## Apps

- PDF
  - Print, download
  - Style like a mix of PDF.js, Chrome PDF & Adobe Reader
- Explorer
  - Breadcrumb bar
  - Item count / status bar
  - Stay highlighted but grey when window is unfocused
  - Limit scroll viewport to list view
- Document Viewer for Blog (https://webodf.org/)
- Clippy.JS (https://www.smore.com/clippy-js)

## Data

- Blog posts as docs

# Post-MVP

- Start Menu
- next-optimized-images
- URL Routing to apps/files
- Icons
  - Image optimization (WebP & responsive)
  - Text un-truncate on selection (Don't truncate icons for now)
- Window
  - Top drag constraints
  - Avoid storing stackOrder in every app
- Explorer
  - Title change to current folder
  - Faster select highlighting (via onFocus)
  - Resizable columns
- DOS
  - Virtual keyboard on mobile
- Winamp
  - Clicking taskbar entry does not focus app
  - Focus isn't reliable on mobile
  - Position logic (x|y / 2) is messy
  - Seek bar shows when minimized and playing
- Fix tabindex (https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex)

# Ideas

- JS Paint (https://github.com/1j01/jspaint)
- Minesweeper (https://github.com/ziebelje/minesweeper)
- IRC Client (https://thelounge.chat/)
  - https://github.com/gummipunkt/thelounge_theme_mircalike
- Code Editor (https://codemirror.net/, https://ace.c9.io/)
- Photo Viewer
