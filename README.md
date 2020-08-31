# TODO

## INTERESTING

#### Windows

- Cascading
- Restore `x`, `y` ,`width` & `height` when exiting from minimize
- Maximize

#### DOS

- Pause when not in focus

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
- Icon label truncation
  - https://css-tricks.com/snippets/css/truncate-string-with-ellipsis/

#### Blog

- iFrame the current blog until new app is done?
- Mockup posts to begin styling
  - https://www.lipsum.com/
- Follow HTML spec for blog post and comments
  - https://www.w3.org/TR/2013/CR-html5-20130806/sections.html#the-article-element

## MEDIUM

#### Winamp
- Winamp stays foreground until it's been clicked at least once

#### Taskbar

- Replicate W10 characteristics
  - What is still not right?
  - Systray and how it looks when loaded with entries

#### Icons

- Replicate W10 characteristics
  - What is left to do?
  - I am not happy with the padding/size compared to W10

#### Windows

- Replicate OSX characteristics
  - Change `<header>` background color to a gradient
  - Greyscale entire `<header>` when window is not in focus
  - Add icon to left of `<header>` title
  - https://docs.microsoft.com/en-ca/windows/win32/uxguide/win-window-mgt
- `<section>` <-> `<article>` which where?
- Windows similar to OSX Genie effect on min/max

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

#### DOS

- Closing window didnt kill DOS
- Loading screen until app is running
  - Hide startup text until at least the 1st load
- Focus window when clicking `<canvas>`

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
- What should the base background color be? (Behind Vanta)
