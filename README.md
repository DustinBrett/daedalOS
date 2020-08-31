# TODO

## INTERESTING

#### Windows

- Maximize

#### Animations

- https://www.framer.com/api/motion

### FUTURE

- JS Paint (https://github.com/1j01/jspaint)
- Clippy.JS (https://www.smore.com/clippy-js)
- Minesweeper (https://github.com/ziebelje/minesweeper)
- PDF.js (https://github.com/mozilla/pdf.js)
  - Use to display Resume
- File Explorer
  - https://github.com/jvilk/BrowserFS
  - Make blog using file explorer + WebODF
- Word Processor (https://webodf.org/)
- Photo Viewer
- Calendar
- Notepad/code editor
  - Show the sites source code
- Session Management
- IRC Client, visuals like mIRC circa '95
- System tray
- Local internal muting/volume control of games/agent/etc (access in systray)
- Chat/Messenger/Contact Component
- PWA

## HIGH

#### Windows

- Ability to maximize and override for purposes like fullscreen
  - Keep aspect ratio
- Constraints on dragging and resizing
  - Only stop dragging `top < 0`
- Fix touch resizing `top` instead of dragging

#### Icons

- Make draggable (w/Constraints)
- Double clicking should open if minimized
  - `update` should allow multiple keys to be passed into app
- Icon label truncation
  - https://css-tricks.com/snippets/css/truncate-string-with-ellipsis/

## MEDIUM

#### Icons

- Redo padding and sizing of containers
- Upon starting app show some loading indications

#### Taskbar

- Trigger `:focus` when setting foreground
- If minimized disable any `.foreground`, `:focus` or `:active` effects
- Hover was resizing slightly on mobile when bar is full

#### Taskbar, Icons & Windows

- Fix text label truncation

#### Apps

- Allow updating mulitple key/value's with a single `updateApps`
- Avoid storing `stackOrder` within every app

#### Windows

- Cascade upon opening
- Restore `x`, `y` ,`width` & `height` when exiting from minimize
- Change `<header>` background color to a gradient
- Greyscale entire `<header>` when window is not in focus
- Add icon to left of `<header>` title
- Make scrollbar 1-3 px wider
- Titlebar text was too bold in Safari (Why was it different?)
- Remove hard coded z-index in `<Windows />`

#### DOS

- Focus window when clicking `<canvas>`
- Close app when `EXIT` is typed

#### Winamp

- Focus is not working reliably
  - Touch events are not focusing on winamp
- Equalizer needs canceling of drag controls

## LOW

#### Winamp

- Mildrop (https://github.com/jberg/butterchurn)

#### Icons

- Better quality icons

#### DOS

- Loading screen until app is running
  - Hide startup text until at least the 1st load
- Closing window doesn't fully kill DOS

#### Metadata

- Add favicon

## VERY LOW

#### Production

- Add Sentry monitoring to project

#### Document

- Move `lockDocumentTitle` somewhere modular

#### Public

- Git ignore public, make script to get files, add to `package.json`
  - https://archive.org/download/DoomsharewareEpisode/doom.ZIP
  - https://archive.org/download/CommanderKeenGoodbyeGalaxy/4keen.ZIP
  - https://js-dos.com/6.22/current/wdosbox.js
  - https://js-dos.com/6.22/current/wdosbox.wasm.js
  - https://github.com/lucmult/winamp2-js/raw/master/mp3/llama-2.91.mp3
  - https://archive.org/download/winampskin_SpyAMP_Professional_Edition_v5/SpyAMP_Professional_Edition_v5.wsz

#### Accessibility

- Add i18n support, w/auto-detect & dynamic `<html lang />`
- Negative tabindex (https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex)

#### Wallpaper

- More complex color cycling for rainbow effect (https://krazydad.com/tutorials/makecolors.php)
- Go back to using Vanta npm (Need camera to update on load)
