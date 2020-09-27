# MVP

## Current Focus

- Windows
  - Maximized mobile is not accounting for taskbar
  - Animate maximize as is done on osx
  - Cascade is causing visual glitch during max
  - Create WindowTitleBar component
    - Double clicking titlebar, same as maximize
    - Title text should truncate at far right of titlebar
  - Disable top resize handle on mobile to improve dragging

## System

- Images
  - next-optimized-images (https://web.dev/image-aspect-ratio)
- File Manager
  - Change drag drop logic to Directory and have it write the file
  - Favicon size is showing `NaN` sometimes
  - Sort contents by name by default
  - Complete UI/Toolbar/Breadcrumb Bar
- Icons
  - zIndex on drag should be above windows
  - Switch to `grid` to fix icon landscape issues (https://grid.layoutit.com/)
  - Truncation breaks at 3 lines
- Side-By-Side Compare
  - Windows
  - Icons
  - Taskbar

## Apps

- ODF Viewer (https://webodf.org/)
  - Convert blog posts into `.odf` files
- PDF Viewer
  - Update Resume
- Winamp
  - Positioning and animation issues on load
  - Seek bar visible when minimized and playing

# Post-MVP

## System

- Start Menu
- Save Session
- URL Routing via opening `.url`

## Apps

- DOS
  - Virtual keyboard on mobile
- Winamp
  - Issue with focus when clicking via taskbar and on mobile
- JS Paint (https://github.com/1j01/jspaint)
- Minesweeper
  - https://github.com/ziebelje/minesweeper
  - https://github.com/ShizukuIchi/minesweeper
- Assistant (https://www.smore.com/clippy-js)
- IRC Client (https://thelounge.chat/)
  - https://github.com/gummipunkt/thelounge_theme_mircalike
- Code Editor (https://codemirror.net/, https://ace.c9.io/)
- REPL (https://github.com/replit/ReplitClient.js)
- Remote Desktop (https://github.com/novnc/noVNC)
- Video Converter (https://github.com/Etwas-Builders/modfy.video)
- Video Player (https://github.com/videojs/video.js)
- Photo Viewer/Editor (https://github.com/imgly/pesdk-html5-build/tree/master/pesdk-v5)
