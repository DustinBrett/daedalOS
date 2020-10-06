# MVP

## Current Focus

- Windows
  - Minimize a maximized window causes issue
- Icons
  - zIndex on drag should be above windows
  - Switch to `grid` to fix icon landscape issues (https://grid.layoutit.com/)
  - Save icon positions

## System

- Start Menu
- Desktop
- File Manager
  - Scale open/close from center of icon image
  - Switch to react-table for resizable/sortable/scrollable columns
  - Sort contents by name/date
  - Truncate all text (line height never changes)
  - Cache file sizes during `genfs` and on uploads
  - Complete UI/Toolbar/Breadcrumb Bar
- Windows
  - Max width/height padding
  - Cascade padding
    - https://docs.microsoft.com/en-ca/windows/win32/uxguide/win-window-mgt#window-location

## Apps

- Winamp
  - Positioning and animation issues on load
  - Seek bar visible when minimized and playing
  - Issue with focus when clicking via taskbar and on mobile
- Document Viewer (https://webodf.org/)
- PDF Viewer
- JS Paint (https://github.com/1j01/jspaint)
- Minesweeper
  - https://github.com/ziebelje/minesweeper
  - https://github.com/ShizukuIchi/minesweeper

# Post-MVP

## System

- Improve titlebar text to truncate better
- Save Session
- URL Routing via opening `.url`
- Icon text truncation breaks at 3 lines

## Apps

- DOS virtual keyboard on mobile
- Video Player (https://github.com/videojs/video.js)
- Photo Viewer
