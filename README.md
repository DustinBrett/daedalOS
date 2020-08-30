# TODO

## INTERESTING

#### Windows

- Need to keep track of z-index when new windows take/lose focus
- Cascading windows
- Restore `x`, `y` ,`width` & `height` upon return from minimize
  - `<Window />` will need access to updateApp

#### Animations

- https://www.framer.com/api/motion

## FUTURE

- JS Paint (https://github.com/1j01/jspaint)
- Clippy.JS (https://www.smore.com/clippy-js)
- PDF.js (https://github.com/mozilla/pdf.js)
  - Use to display Resume
  - Maybe `react-pdf-viewer`
- Terminal app w/Transparent window
  - Replicate iTerm characteristics
- File Explorer
- Image Gallery
- Travel Map
- Calendar
- Basic web browser
- Notepad/code editor
  - Show the sites source code, meta style
- Session Management
- Voice Assistant
- IRC Client, visuals like mIRC circa '95
- System tray
- Virtual machine to run Windows 95? Is it possible?
- Local internal muting of games/agent/etc
  - Volume control and mute control in sys tray
- Chat bubbles, Messenger style

## HIGH

#### Windows

- Ability to maximize and override for purposes like fullscreen
  - Keep aspect ratio
- Constraints on dragging and resizing
  - Only stop dragging `top < 0`

#### Icons

- Make draggable (w/Constraints)
- Double clicking should open if minimized
  - `update` should allow multiple keys to be passed into app
- Fix label being on 2+ lines pushing icon above container
  - Changes should happen in ellipsis mixin

#### Taskbar

- Initial clicking of unfocused entry should not toggle minimize
  - It should focus the entry and it's window

#### Blog

- iFrame the current blog until new app is done?
- Mockup posts to begin styling
  - https://www.lipsum.com/
- Follow HTML spec for blog post and comments
  - https://www.w3.org/TR/2013/CR-html5-20130806/sections.html#the-article-element

## MEDIUM

#### Taskbar

- Replicate W10 characteristics
  - Add Padding to highlight bar which shrinks on hover

#### Icons

- Replicate W10 characteristics

#### Windows

- Replicate OSX characteristics
  - Change `<header>` background color to a gradient
  - Greyscale entire `<header>` when window is not in focus
  - Add icon to left of `<header>` title
  - https://docs.microsoft.com/en-ca/windows/win32/uxguide/win-window-mgt
- `<section>` <-> `<article>` which where?
- Windows similar to OSX Genie effect

#### Mixins

- Extract out more magic numbers
- Extract out similair styling
  - `.foreground` & `@taskbarEntryHover`
  - `#minimize`, `#maximize` & `#close`
  - Text/box shadow effects

## LOW

#### General

- Make tabindex's negative
  - https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex

#### Wallpaper

- More complex color cycling for rainbow effect
  - https://krazydad.com/tutorials/makecolors.php

#### Games

- Game `Loader.tsx` so that I only need to pass the vars

#### DOS

- Pause when not in focus
- Loading screen until app is running
- Stop using `require` if possible
- Focus window when clicking `<canvas>`
- Hide startup text until at least the 1st load

#### Metadata

- Add favicon

#### Document

- Add i18n support, w/auto-detect & dynamic `<html lang />`
- Move `lockDocumentTitle` somewhere modular
  - Add a check so this can't run twice during dev work

#### Blog

- Add `<time>` for post date/time
- Add comments from blog and CouchSurfing
- Add "Accommodations" links to relevant posts
- Convert posts to JSON and `import` (Can mockup posts initially)

## Questions

- Should I use `Segoe UI`? `system-ui`?
- What should the background color be? (Behind Vanta)
