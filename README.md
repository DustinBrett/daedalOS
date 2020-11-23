# MVP Bugs

- Explorer
  - Filename should truncate when too long
- Icon
  - WebODF icon for doc types
- Focus
  - Reopening app changes foreground id but not focus
  - Clicking iFrame doesn't focus window
  - Winamp titlebar not properly focused on load
- Files
  - Uploaded files not working on subsequent loads

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
  - Re-render maximized window on layout/orientation changes
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
