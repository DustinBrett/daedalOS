# MVP

- Define WindowStateCycler
- windowMotionSettings needs DRY'ing

## System

- Session
  - icon selected
- Windows
  - Animate min/max with framer (scale transition smooth), min/max from taskbar entry (useCycle)
  - Cascade glitch before/after maximize
  - 2x1 px border needs adjusting
- Quality
  - next-optimized-images
    - https://web.dev/image-aspect-ratio/?utm_source=lighthouse&utm_medium=devtools

## Apps

- Winamp
  - Positioning and animation issues on load
- PDF
  - Fix window SS build error
  - Download & Print
  - Auto Zoom
  - Complete UI/Toolbar
- Explorer
  - Faster select highlighting (via onFocus)
  - Breadcrumb Bar
  - Complete UI/Toolbar
  - Favicon is showing NaN after drag/drop demo
- Document Viewer for Blog (https://webodf.org/)

## Data

- Blog posts as docs
- Update Resume

# Post-MVP

- Start Menu
- Startup URL Routing to programs/files (Part of url.tsx)
- Clippy.JS (https://www.smore.com/clippy-js)
- Icons
  - Image optimization (WebP & responsive)
  - Text un-truncate on selection (Don't truncate icons for now)
  - Horizontal rendering issues with mixed 1-2 line icon labels (CSS Grid)
  - zIndex on drag should be above windows
- Window
  - Title text should be more reactive
  - Disable resizing/touch by top handle on mobile
- Explorer
  - Resizable columns
  - Cache size and modified time
- Taskbar
  - Entries should resize smoother
  - Blur content behind taskbar
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
- Minesweeper
  - https://github.com/ziebelje/minesweeper
  - https://github.com/ShizukuIchi/minesweeper
- IRC Client (https://thelounge.chat/)
  - https://github.com/gummipunkt/thelounge_theme_mircalike
- Code Editor (https://codemirror.net/, https://ace.c9.io/)
- Photo Viewer

# Performance

- useCallback/useMemo
- https://github.com/welldone-software/why-did-you-render
- https://chrome.google.com/webstore/detail/react-developer-tools
