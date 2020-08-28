# TODO

## INTERESTING

#### Wallpaper
- Subtle light shifting rainbow effect
  - https://www.vantajs.com/
- Alternative: https://github.com/wagerfield/flat-surface-shader

#### Animations
- Windows similar to OSX Genie effect
- https://www.framer.com/api/motion

## FUTURE

- Webamp (https://github.com/captbaritone/webamp)
  - SpyAMP Pro Green (Similar: https://archive.org/details/winampskin_SpyAMP_Pro_Zeus)
- JS Paint (https://github.com/1j01/jspaint)
- Clippy.JS (https://www.smore.com/clippy-js)

## HIGH

#### Windows
- Need to keep track of z-index when new windows take/lose focus
- Constraints on dragging and resizing
  - Only stop dragging `top < 0`
- Conditionally set `lockAspectRatio` (Lock for DOS)
- Conditionally hide vertical scrollbar (Hide for DOS)
- Restore `x`, `y` ,`width` & `height` upon return from minimize
  - Reset on close

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

#### Mixins
- Fix hidden overflow cutting off text-shadows
- Extract out more magic numbers
- Extract out similair styling
  - `.foreground` & `@taskbarEntryHover`
  - `#minimize`, `#maximize` & `#close`
  - Text/box shadow effects

## LOW

#### DOS
- Loading screen until app is running
- Stop using `require` if possible
- Focus window when clicking `<canvas>`

#### MetaData
- Add favicon

#### Document
- Add i18n support, w/auto-detect & dynamic `<html lang />`
- Move `lockDocumentTitle` somewhere modular
  - Add a check so this can't run twice during dev work

#### Blog
- Add `<time>` for post date/time
- Add comments from blog and also possibly CouchSurfing

#### Blog
- Convert posts to JSON and `import` (Can mockup posts initially)

## Questions
- Should I use `Segoe UI`? `system-ui`?
- What should the background color be? (Behind Vanta)
