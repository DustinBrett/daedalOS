# MVP

## System

- File Manager
  - Switch to react-table for resizable/sortable/scrollable columns
  - Sort contents by name/date
  - File stat solution needed for uploaded files
  - Add modified time
  - Open folders in new windows
  - Clicking into directory messes with foregroundId
- Taskbar
  - Add padding to left of clock if needed
- Icons
  - Switch to `grid` to fix icon landscape issues (https://grid.layoutit.com/)
  - Save icon positions (Stop using translate if possible)
  - zIndex on drag should be above windows
  - Image elements do not have explicit width and height
- Windows
  - Cascade padding with max width/height padding
  - Animate open/close from icon on list view
  - Delay foregrounding next window until close/minimize is done animating
- Start Menu
  - Document shortcut function
  - START MENU click to close
  - Title's only when not showing submenu
  - Clicking all apps closes or sends to all apps
  - Drop shadow on expanded button bar
  - Expanded button bar background color needs work
  - Top/bottom border on hovers
  - Blur effect isnt right

## Apps

- Winamp
  - Positioning and animation issues on load
  - Seek bar visible when minimized and playing
  - Issue with focus when clicking via taskbar and on mobile
- Document Viewer (https://webodf.org/)
- PDF Viewer
- JS Paint (https://github.com/1j01/jspaint)
- Minesweeper

## Refactoring

- Move all types defined in .tsx/.ts into .d.ts files
- Extract all magic numbers to variables

# Post-MVP

## System

- Improve titlebar text to truncate better
- Save Session
- URL Routing via opening `.url`
- Icon text truncation breaks at 3 lines
- Improve color cycle (https://krazydad.com/tutorials/makecolors.php)

## Apps

- DOS virtual keyboard on mobile
