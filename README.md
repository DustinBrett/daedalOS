## 🌌 **daedalOS** 🌌

### _Desktop environment in the browser_

![Stars](https://badgen.net/github/stars/DustinBrett/x)
![License](https://badgen.net/github/license/DustinBrett/x)

# Feature Overview

[![Feature Overview](https://img.youtube.com/vi/CkvKPspIPLs/mqdefault.jpg)](http://www.youtube.com/watch?v=CkvKPspIPLs)

# Try It 🏁

### Clone repo

- [Git](https://git-scm.com/downloads)

```
git clone https://github.com/DustinBrett/daedalOS.git
cd daedalOS
```

### Yarn

- [Node.js](https://nodejs.org/en/download/) (**v16 LTS**)
- [Yarn](https://classic.yarnpkg.com/en/) (`npm install --global yarn`)

```
yarn
```

##### Development

```
yarn build:fs
yarn dev
```

##### Production

```
yarn build
yarn start
```

### Docker

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

```
docker build -t daedalos .
docker run -dp 3000:3000 --rm --name daedalos daedalos
```

# System 🧠

### [File System](https://github.com/jvilk/BrowserFS)

- File Explorer
  - Back, Forward, Recent locations, Up one level, Address bar, Search
- [Drag & Drop](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) File Support (internal & external)
  - Loading progress dialog
- ZIP ([write support](https://www.npmjs.com/package/fflate)), [ZIP](https://github.com/jvilk/BrowserFS/blob/master/src/backend/ZipFS.ts)/[ISO](https://github.com/jvilk/BrowserFS/blob/master/src/backend/IsoFS.ts) read support, [7Z/GZ/RAR/TAR/etc. extract](https://github.com/use-strict/7z-wasm) support
- Writes to [IndexedDb](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- Group selection/manipulation & drag to sort/arrange
- Dynamic and auto cached icons for [music](https://github.com/Borewit/music-metadata-browser), images, video & game saves
- Context Menus
  - Cut, Copy, Create shortcut, Delete, Rename
  - [Add file(s)](https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications), [Map directory](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
  - Open with, Open file/folder location, Open in new window, Open Terminal here
  - Download, Add to archive, Extract here, Set as wallpaper, Convert audio/video/photo/spreadsheets
  - Sort by, New Folder, New Text Document
- Keyboard Shortcuts
  - CTRL+C, CTRL+V, CTRL+X, CTRL+A, Delete
  - F2, F5, Backspace, Arrows, Enter
  - SHIFT+CTRL+R, SHIFT+F10, SHIFT+F12
  - In Fullscreen: Windows Key, Windows Key + R
- File information tooltips
- Allow sorting by name, size, type or date
  - Persists icon position/sort order

### Windows

- [Resizable and Draggable](https://github.com/bokuweb/react-rnd)
- Minimize, Maximize & Close
- Persists size/position/maximized states
- [Animates](https://www.framer.com/motion/) opening and closing

### Start Menu

- Expandable Sidebar
  - Apps list, Documents/Pictures/Videos shortcuts, Power (clears session)
- Spotlight visual effect
- Folder support
- Keyboard shortcut opens with **_SHIFT+ESC_**
  - Or Windows Key when in fullscreen

### Taskbar

- [Peek](https://github.com/bubkoo/html-to-image) hover preview of windows
- Focused window indicator

### Clock

- Runs in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
  - Drawn in an [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- NTP server time mode ([ntp.js](http://www.ntpjs.org/))
- Synced to system clock on load
- Date tooltip

### Background

- Dynamic animated wallpapers ([OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)/[Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers))
  - [Waves](https://www.vantajs.com/?effect=waves)
  - [Hexells](https://znah.net/hexells/)
  - [Matrix](https://rezmason.github.io/matrix/)
  - [Coastal Landscape](https://www.shadertoy.com/view/fstyD4)
- Set via images (Fill, Fit, Stretch, Tile, Center)
- [Astronomy Picture of the Day](https://api.nasa.gov/#apod)

### URL

- Query parameter loading
  - Examples:
    - `/?url=/CREDITS.md`
    - `/?app=Browser`

# Apps 🧪

### [BoxedWine](http://www.boxedwine.org/) (**_.exe, .zip_**)

- Runs 16/32-bit Windows applications

### Browser (**_.htm, .html_**)

- Loads websites (_w/HTTP header support_)
- Bookmark bar
- Favicon support
- Back/Forward & Reload
- Google search via Address bar

### [DevTools](https://eruda.liriliri.io/)

- Console, Elements, Network, Resources, Sources, DOM
- Activate from Start Menu or **_SHIFT+F12_**

### [EmulatorJS](https://github.com/ethanaobrien/emulatorjs) (**_.32x, .a26, .a52, .a78, .gb, .gba, .gbc, .gen, .gg, .j64, .jag, .lnx, .n64, .nds, .nes, .ngc, .ngp, .pce, .sfc, .smc, .smd, .sms, .v64, .vb, .vboy, .ws, .wsc, .z64_**)

- Plays console game roms

### [IRC](https://kiwiirc.com/)

- Internet Relay Chat Client
- Connects over WebSockets

### [js-dos](https://js-dos.com/) (**_.exe, .jsdos, .zip_**)

- DOS emulator
- Automatic save states on close
  - /Users/Public/Snapshots
- Automatic window resize

### [Marked](https://marked.js.org/) (**_.md_**)

- Markdown Viewer

### [Monaco Editor](https://microsoft.github.io/monaco-editor/)

- Code/text editor
- Supports all file types
- Save files via **_CTRL+S_**
- Line count, cursor position, language id
- [Prettier](https://prettier.io/) formatting
  - json, js/ts, css/sass/less, html, markdown

### [Paint](https://github.com/1j01/jspaint) (**_.bmp, .gif, .ico, .jpg, .png, .tiff, .webp,_**)

- Create & edit images

### [PDF](https://mozilla.github.io/pdf.js/) (**_.pdf_**)

- Render/Print PDF's
- Page current/count & Zoom

### Photos

- [Supported Formats](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#supported_image_formats)
- Fullscreen & [Zoom](https://github.com/anvaka/panzoom)

### [Ruffle](https://ruffle.rs/) (**_.swf, .spl_**)

- Flash Player emulator

### [Terminal](https://xtermjs.org/)

- File system support
- Autocomplete & history
- Command list via `help`
- [Git support](https://isomorphic-git.org/) (checkout & clone)
- [Python support](https://pyodide.org/) (**_.py_**)
- [WebAssembly Package Manager](https://wapm.io/)
  - Ex: `wapm cowsay moo` ([\#](https://wapm.io/package/cowsay))
- [Weather information](https://wttr.in/)
- [eSheep](https://adrianotiger.github.io/web-esheep/)
- Activate from Start Menu or **_SHIFT+F10_**

### [TinyMCE](https://www.tiny.cloud/tinymce/) (**_.rtf, .whtml_**)

- Read & WYSIWYG modes
- File save support

### [Virtual x86](https://copy.sh/v86/) (**_.img, .iso_**)

- x86 emulator
- Automatic save states on close
  - /Users/Public/Snapshots
- Automatic window resize

### [Video Player](https://videojs.com/)

- [Supported Formats](https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Video_codecs)
- Plays [YouTube](https://github.com/videojs/videojs-youtube) videos/shortcuts

### [Vim](https://github.com/coolwanglu/vim.js)

- Code/text editor
- Supports all file types

### [Webamp](https://webamp.org/) (**_.mp3, .wsz_**)

- Winamp audio player
- [Skin support](https://skins.webamp.org/)
- Playlist & streaming support
- Visualization support (["Milkdrop"](https://github.com/jberg/butterchurn))
