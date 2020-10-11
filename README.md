# MVP

## Current Focus

- Taskbar
  - Clicking taskbar after focusing window is not minimizing
  - Minimize is not going to proper taskbar entry position
- Windows
  - Minimize when maximized isnt animating to taskbar entry
  - Animate open/close from icon on list view
- Icons
  - zIndex on drag should be above windows
- Start Menu
  - <ol> needs to be to the right, buttons on left
  - 0 height by default
  - animate to 100% height
  - On click the button bg color gets lighter
  - Stays lighter until menu goes away
  - hover on start menu has a circle gradient from cursor for 15-20px
  - hover lights up borders of buttons and bg of items
  - START | All Apps | Dustin Brett | Documents | Power
  - Highlight color for icon, text color and left border (4px) for buttons
  - 1px border on right side of button menu
  - Start menu is also transprent but is more blurred and more dark slightly
  - Add BG blur backdrop-filter
  - Unfocus/hide start menu when clicking outside start menu

## System

- File Manager
  - Scale open/close from center of icon image
  - Switch to react-table for resizable/sortable/scrollable columns
  - Sort contents by name/date
  - Truncate all text (line height never changes)
  - File stat solution needed for uploaded files
  - Favicon list entry heights are not consistent
  - Add modified time
  - Toolbar & Breadcrumb Bar
- Icons
  - Switch to `grid` to fix icon landscape issues (https://grid.layoutit.com/)
  - Save icon positions
- Windows
  - Max width/height padding
  - Cascade padding
    - https://docs.microsoft.com/en-ca/windows/win32/uxguide/win-window-mgt#window-location
  - Delay foregrounding next window until close/minimize is done animating
  - Hover on button not nav, like osx (make nav padding tight)

## Apps

- DOS
  - Visual glitch on un-minimizes
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

## Refactoring

- Move all types defined in .tsx/.ts into .d.ts files
  - Use "Props" when proper
- Alphabetize all constants, variables, props, functions, etc
- Group exports together at the bottom
- Try styled components to see if its better
- Extract all magic numbers to variables

# Post-MVP

## System

- Right Click Menu's
- Improve titlebar text to truncate better
- Save Session
- URL Routing via opening `.url`
- Icon text truncation breaks at 3 lines
- Improve color cycle (https://krazydad.com/tutorials/makecolors.php)

## Apps

- DOS virtual keyboard on mobile
- Video Player (https://github.com/videojs/video.js)
- Photo Viewer
