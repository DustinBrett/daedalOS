# MVP Bugs

- Explorer
  - Filename is showing instead of app name in titlebar
- Icons
  - WebODF icon for doc types
- Windows
  - Reopening explorer changes foreground id but not focus
- Winamp
  - Titlebar should match foreground state on initial blur & mobile

# MVP Refactors

- Hook (useWallpaper, useWinamp)
- Effect (maybeReFocus, maybeToggleMaximize)

# Post MVP

- Wallpaper
  - Use brighter rainbow effect
- Start Menu
  - START MENU click to toggle button bar
  - Entries are slow on first and subsequent loads
- File Manager
  - Resizable/sortable/scrollable columns
  - Modified date/time
  - Expandable tree-view of directories (List & Menu View)
  - Store uploaded file stats
- System
  - Context menus on right click or touch hold
- Toolbar
  - Back, Forward, Refresh & Home Buttons
  - Address & Search Inputs
- Windows
  - Initial load maximized if dimensions > screen
  - Save maximized state on close
  - Fix missing exit animation on windowless apps
- Icons
  - Dragging should go in front of windows
  - Store icon positions
  - Switch to grid layout
  - Fix 3rd line truncation (hiding overflow cuts off shadow)
- DOS
  - Run in web worker to stop animation blocking
- PDF Viewer
  - Finish UI
  - Fix `window` error
