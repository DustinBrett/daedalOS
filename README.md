# Bugs

## System

- File Manager
  - Opening a directory breaks initial foreground focus
- Icons
  - Initial position ghosting & closing animation on mobile
  - Icons don't properly align when landscape view
- Windows
  - Closing animation on uploaded apps doesn't work right

## Apps

- Winamp
  - Exit animation doesn't work
  - Titlebar not inactive after initial blur

# High Priority

## System

- File Manager
  - Seperate windows per directory
- Icons
  - Z-index issue during dragging
  - Double check colors & behaviours
- Start Menu
  - Documents shortcut
  - START MENU click to toggle button bar
  - Power should reset all caches
  - Blur on menu and buttons submenu

## Apps

- Blog
  - Toolbar
    - Back & Forward Buttons
      - iframe.contentWindow.history.back() | forward()
    - Refresh & Home Buttons
    - Address (Read-Only) & Search (w/WordPress) Inputs
- PDF Viewer
- WebODF

# Post MVP

## System

- Desktop
  - Use brighter rainbow effect with wallpaper
- File Manager
  - Resizable/sortable/scrollable columns
  - Modified date/time
  - Expandable tree-view of directories
  - Store uploaded file stats
- Icons
  - Save icon positions
- Windows
  - Save maximized state on close
  - Initial load maximized if dimensions > screen
