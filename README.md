# MVP

## System

- Quality
  - Double check colors and sizes (Digital Color Meter)
- Windows
  - Size opening/positioning logic
    - Relative to the viewport, orientation & resolution
    - Pre-define ideal min sizes for windows
  - Animate min/max with framer (fix z-index)
- Start Menu

## Apps

- PDF
  - Download & Print
  - Auto Zoom
  - Complete UI/Toolbar
- Explorer
  - Breadcrumb Bar
  - Complete UI/Toolbar
- Document Viewer for Blog (https://webodf.org/)

## Data

- Blog posts as docs

# Post-MVP

- next-optimized-images
- Startup URL Routing to programs/files (Part of url.tsx)
- Clippy.JS (https://www.smore.com/clippy-js)
- Icons
  - Image optimization (WebP & responsive)
  - Text un-truncate on selection (Don't truncate icons for now)
  - Horizontal rendering issues with mixed 1-2 line icon labels (CSS Grid)
- Window
  - Top drag constraints
  - Avoid storing stackOrder in every app
- Explorer
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
