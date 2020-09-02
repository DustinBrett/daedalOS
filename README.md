# TODO

## NOTES

### Missing interactions

- Clicking desktop should deselect taskbar entry
- Clicking taskbar entry should focus window
- Clicking canvas should focus the window
- Hovering window buttons should show all icons
- Icons need to be .ico or .svg

### Visuals

- Slightly brighter gradient on titlebar
- Text truncation everywhere
- 1px seperate for taskbar entries

## FUTURE

#### 1st

- Animations (https://www.framer.com/api/motion)
- File Explorer (https://github.com/jvilk/BrowserFS)
- Word Processor (https://webodf.org/)
- Shortcuts (Latest blog post in blog folder on desktop as shortcut)

#### 2nd

- About Me "Dustin Brett" Icon/Profile/Contact app
- PDF.js (https://github.com/mozilla/pdf.js)
  - Use to display Resume
- JS Paint (https://github.com/1j01/jspaint)
- Code Editor (https://codemirror.net/)
  - Show the sites source code
- Terminal (https://xtermjs.org/)
- System tray
- Local internal muting/volume control of games/agent/etc

#### 3rd

- Clippy.JS (https://www.smore.com/clippy-js)
- Photo Viewer
- Calendar
- Session Management
- PWA

#### 4th

- IRC Client, visuals like mIRC circa '95
- Minesweeper (https://github.com/ziebelje/minesweeper)
- Chat/Messenger/Contact Component

## HIGH

#### Body

- Background color should be black like Windows when explorer.exe is off

#### Windows

- Ability to maximize
  - Lock aspect ratio with `maxWidth`
- Stop minimize from re-rendering the app
- Fix touch resizing `top` instead of dragging

#### Icons

- Make draggable
- Double clicking should open if minimized
  - `update` should allow multiple keys to be passed into app

#### Taskbar, Icons & Windows

- Fix text label truncation
  - https://css-tricks.com/snippets/css/truncate-string-with-ellipsis/

## MEDIUM

#### Icons

- Upon starting app show some loading indications

#### Taskbar

- Trigger `:focus` when setting foreground
- If minimized disable any `.foreground`, `:focus` or `:active` effects
- Hover was resizing slightly on mobile when bar is full
- Clicking when active should minimize

#### Windows

- Remove hard coded z-index in `<Windows />`
- Reveal all buttons upon hover for min/max/close

#### DOS

- Focus window when clicking `<canvas>`
- Close app when `EXIT` is typed
- Add virtual keyboard on mobile

#### Winamp

- Focus is not working reliably
  - Touch events are not focusing on winamp
- Equalizer needs canceling of drag controls
- Fix requiring `x|y / 2` for position to look correctish

#### React-Use (https://github.com/streamich/react-use)

- useBattery: Show battery in sys tray
- useIdle: Show screen saver
- useLongPress: Show right click menu
- useMediaDevices: Show device manager
- useNetwork: Show network info / sys tray icon

## LOW

#### Apps

- Avoid storing `stackOrder` within every app

#### Winamp

- Milkdrop (https://github.com/jberg/butterchurn)
- Build up a collection of cool songs in the playlist
  - Sourced legally and streamable ideally

#### Icons & Windows

- Only constrain dragging above `top: 0`

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

#### Public

- Git ignore public, make script to get files, add to `package.json`
  - https://archive.org/download/DoomsharewareEpisode/doom.ZIP
  - https://archive.org/download/CommanderKeenGoodbyeGalaxy/4keen.ZIP
  - https://js-dos.com/6.22/current/wdosbox.js
  - https://js-dos.com/6.22/current/wdosbox.wasm.js
  - https://github.com/lucmult/winamp2-js/raw/master/mp3/llama-2.91.mp3
  - https://archive.org/download/winampskin_SpyAMP_Professional_Edition_v5/SpyAMP_Professional_Edition_v5.wsz
  - Fonts?

#### Accessibility

- Add i18n support, w/auto-detect & dynamic `<html lang />`
- Negative tabindex (https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex)

#### Wallpaper

- More complex color cycling for rainbow effect (https://krazydad.com/tutorials/makecolors.php)
- Go back to using Vanta npm (Need camera to update on load)
