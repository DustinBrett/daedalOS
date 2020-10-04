# MVP

## Current Focus

- Windows
  - Position of 2nd window is effected by 1st and so on
  - Does startIndex still make sense for motions/taskbar?
    - Could it have 2 processes with same startIndex?

## System

- Start Menu
- Desktop
  - Use grid to fix landscape alignment
  - Save icon positions
- File Manager
  - Scale open/close from center of icon image
  - Switch to react-table for resizable columns
  - Sort contents by name/date
  - Truncate all text (line height never changes)
  - Background still not lining up
  - File sizes
    - Cache file sizes during `genfs`
    - File size sometimes returns `-1`
    - File size not correct for new files
  - Complete UI/Toolbar/Breadcrumb Bar
- Icons
  - zIndex on drag should be above windows
  - Switch to `grid` to fix icon landscape issues (https://grid.layoutit.com/)
  - Truncation breaks at 3 lines

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

- Improve titlebar text to truncate better
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
