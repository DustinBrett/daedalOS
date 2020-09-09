# TODO - MVP

## System

### General

- Animations (https://www.framer.com/api/motion)
  - Max/min (https://www.framer.com/api/motion/animation/#animation-controls)

## Apps

### New Apps

- JS Paint (https://github.com/1j01/jspaint)
- Word Processor (https://webodf.org/)

### DOS

### Explorer

- Title should change to current folder

### PDF

- Style like generic PDF viewer

# TODO - Post MVP

### Post MVP

- Icon text un-truncate on selection (Don't truncate icons for now)
- System Tray: React-Use (https://github.com/streamich/react-use)
  - useBattery, useIdle, useLongPress, useMediaDevices, useNetwork
  - useIdle + Pipes (https://github.com/1j01/pipes)

### Priority

- Start Menu
- Window: Open at a size/position relative to the viewport, orientation & resolution
  - Set max sizes for windows and then use rules for below that
- Retune all colors based on Digital Color meter on correct rgb setting

### UI/UX Bugs

- Taskbar: Clicking recently focused entry is minimizing it
- DOS: Can't focus by clicking canvas

### Explorer MVP

- Back/Forward buttons
- Breadcrumb bar
- Item count status bar
- File type icons

### Explorer UI/UX

- Scrolling inside `<tbody>`
- Unselect line when clicking outside table
  - Grey instead of blue if clicking outside window
- `.ico` files can use themselves for their icon
- Alternating colors should continue to bottom

### UI/UX

- Icons: Horiz rendering issues in landscape with mixed 1-2 line icon labels

#### Winamp Bugs

- Focus isn't reliable on mobile
- Clicking taskbar entry does not focus app

#### Post-MVP Features

- Icons: Loading indicator
- Window: Add drag constraint to top
- DOS: Close app when `EXIT` is typed
- DOS: Virtual keyboard on mobile
- Winamp: Milkdrop (https://github.com/jberg/butterchurn)
- General: URL Routing to apps/files
- Explorer: Link with JS-DOS storage
- Explorer: Delete/Create/Drag/Drop files
- Explorer: Search files
- Explorer: Resizie column headers
- Games: Duke Nukem 3D & Wolfenstein 3D

### Code Quality

- Document: Fix tabindex (https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex)
- Winamp: Position logic (`x|y / 2`) is messy
- Window: Avoid storing `stackOrder` in every app
- Window: Remove hard coded z-index

# FUTURE

- Code Editor (https://codemirror.net/, https://ace.c9.io/)
- Terminal (https://xtermjs.org/, https://github.com/jcubic/git)
- Volume Controls (https://github.com/Tonejs/unmute)
- Clippy.JS (https://www.smore.com/clippy-js)
- Minesweeper (https://github.com/ziebelje/minesweeper)
- IRC Client (https://thelounge.chat/)
  - https://github.com/gummipunkt/thelounge_theme_mircalike
- Spreadsheet Editor (https://myliang.github.io/x-spreadsheet)
- Notepad
- Photo Viewer
- Calendar
- Right click menus
- Light/dark theme/modes
- All my personal stuff (photo albums of me, blog posts, etc.)
