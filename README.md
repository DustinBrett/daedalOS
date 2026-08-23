## 🌌 **daedalOS** 🌌

## _Desktop environment in the browser_

![Screenshot](https://raw.githubusercontent.com/DustinBrett/daedalOS/refs/heads/main/public/screenshot.png?raw=true)

### Feature Overview

[![Feature Overview](https://img.youtube.com/vi/djCqHH0SCmA/mqdefault.jpg)](http://www.youtube.com/watch?v=djCqHH0SCmA)

# System 🧠

### [File System](https://github.com/jvilk/BrowserFS)

- File Explorer
  - Back, Forward, Recent locations, Up one level, Address bar, Search
  - Thumbnail & Details Views
- [Drag & Drop](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) File Support (internal & external)
  - Loading progress dialog
- ZIP ([write support](https://www.npmjs.com/package/fflate)), [ZIP](https://github.com/jvilk/BrowserFS/blob/master/src/backends/ZipFS.ts)/[ISO](https://github.com/jvilk/BrowserFS/blob/master/src/backends/IsoFS.ts) read support, [7Z/GZ/RAR/TAR/etc. extract](https://github.com/use-strict/7z-wasm) support
- Writes to [IndexedDb](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- Group selection/manipulation & drag to sort/arrange
- Dynamic and auto cached icons for [music](https://github.com/Borewit/music-metadata-browser), images, video & emulator states
- Context Menus
  - Cut, Copy, Create shortcut, Delete, Rename
  - [Add file(s)](https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications), [Map directory](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
  - Open with options/dialog, Open file/folder location, Open in new window, Open Terminal here
  - Download, Add to archive, Extract here, Set as wallpaper, Set as mouse pointer, Convert audio/video/photo/spreadsheets, Properties (w/Details)
  - Sort by, New Folder, New Text Document
  - Screen Capture
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
- Search menu (w/Recent files)
- AI Chat Agent ([Prompt API](https://docs.google.com/document/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c/edit) & [WebLLM](https://github.com/mlc-ai/web-llm)) (w/Summarize & Image Generation)

### Clock

- Runs in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
  - Drawn in an [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- NTP server time mode ([ntp.js](http://www.ntpjs.org/))
- Synced to system clock on load
- Date tooltip
- Calendar popup

### Background & Screensaver

- Dynamic animated wallpapers ([OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)/[Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers))
  - Milky Way ([density wave theory](https://beltoforion.de/en/spiral_galaxy_renderer/), device orientation parallax)
  - [Waves](https://www.vantajs.com/?effect=waves)
  - [Hexells](https://znah.net/hexells/)
  - [Matrix](https://rezmason.github.io/matrix/)
  - [Coastal Landscape](https://www.shadertoy.com/view/fstyD4)
- Set via image/video (Fill, Fit, Stretch, Tile, Center)
- Picture Slideshow
- [Astronomy Picture of the Day](https://api.nasa.gov/#apod)
- [Art Institute of Chicago](https://api.artic.edu/docs/)
- [Metropolitan Museum of Art](https://metmuseum.github.io/)
- [Lorem Picsum](https://picsum.photos/)
- AI Generated Wallpapers [Stable Diffusion](https://stability.ai/stable-diffusion)
- Custom screen saver file support
  - [3D FlowerBox](https://github.com/kevin-shannon/3D-FlowerBox)
  - [3D Maze](https://github.com/ibid-11962/Windows-95-3D-Maze-Screensaver)
  - [Pipes](https://github.com/1j01/pipes)

### Run Dialog

- Launch apps by alias or paths
- Opens `ipfs:` & `nostr:` URIs

### URL

- Query parameter loading
  - Examples:
    - `/?url=/CREDITS.md`
    - `/?app=Browser`

# Apps 🧪

### [BoxedWine](http://www.boxedwine.org/) (**_.exe, .zip_**)

- Runs 16/32-bit Windows applications

### Browser (**_.htm, .html_**)

- Loads websites (_w/CORS support_)
- Bookmark bar with favicon support
- Proxy support (Wayback Machine & The Old Net)
- Back/Forward & Reload
- Google search via Address bar
- IPFS protocol support
- [chrome://dino](https://github.com/wayou/t-rex-runner) game

### [DesktopFly](https://github.com/DenisSergeevitch/desktop-fly)

- Fruit fly pets driven by a live spiking simulation of 1,275 real [FlyWire](https://flywire.ai/) connectome neurons, with escape, backward retreat, grooming, sleep & circadian rhythm
- Every fly has its own brain & senses: window edges are walkable terrain, dragged windows & the cursor loom, clicks swat, and a takeoff startles nearby flies
- Spawn via `fly` in Terminal or Run dialog

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

### Messenger

- Encrypted direct messaging client
- Utilizes [Nostr Protocol](https://nostr.com/) ([NIP-04](https://github.com/nostr-protocol/nips/blob/master/04.md))
- Automatic public/private key creation

### [Monaco Editor](https://microsoft.github.io/monaco-editor/)

- Code/text editor
- Supports all file types
- Save files via **_CTRL+S_**
- Line count, cursor position, language id
- [Prettier](https://prettier.io/) formatting
  - json, js/ts, css/sass/less, html, markdown

### [OpenType](https://github.com/opentypejs/opentype.js) (**_.otf, .ttf, .woff_**)

- Font viewer

### [Paint](https://github.com/1j01/jspaint) (**_.bmp, .gif, .ico, .jpg, .png, .tiff, .webp,_**)

- Create & edit images

### [PDF](https://mozilla.github.io/pdf.js/) (**_.pdf_**)

- Render/Print PDF's
- Page current/count & Zoom

### Photos

- [Supported Formats](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#supported_image_formats)
  - [HEIF](https://github.com/catdad-experiments/libheif-js) (**_.heic, .heif_**)
  - [JPEG XL](https://github.com/niutech/jxl.js) (**_.jxl_**)
  - [QOI](https://gist.github.com/nicolaslegland/f0577cb49b1e56b729a2c0fc0aa151ba) (**_.qoi_**)
  - [TIFF](https://github.com/photopea/UTIF.js) (**_.tif, .tiff_**)
- Fullscreen & [Zoom](https://github.com/anvaka/panzoom)

### [Ruffle](https://ruffle.rs/) (**_.swf, .spl_**)

- Flash Player emulator

### [Stable Diffusion](https://stability.ai/stable-diffusion)

- Creates 512x512 images using artificial intelligence
- Runs locally using [WebSD](https://mlc.ai/web-stable-diffusion/)

### [Terminal](https://xtermjs.org/)

- File system support
- Autocomplete & history
- Pipe commands together
- Command list via `help`
- [Git support](https://isomorphic-git.org/) (checkout & clone)
- [Python support](https://pyodide.org/) (**_.py_**)
- [WebAssembly Package Manager](https://wapm.io/)
  - Ex: `wapm cowsay moo` ([\#](https://wapm.io/package/cowsay))
- [Weather information](https://wttr.in/)
- [eSheep](https://adrianotiger.github.io/web-esheep/)
- Activate from Start Menu or **_SHIFT+F10_**
- Neofetch
- [FFmpeg](https://github.com/ffmpegwasm/ffmpeg.wasm) & [ImageMagick](https://github.com/KnicKnic/WASM-ImageMagick) conversion

### [TIC-80](https://tic80.com/) (**_.tic_**)

- Runs "fantasy computer" games

### [TinyMCE](https://www.tiny.cloud/tinymce/) (**_.rtf, .whtml_**)

- Read & WYSIWYG modes
- File save support

### [Virtual x86](https://copy.sh/v86/) (**_.img, .iso_**)

- x86 emulator
- Automatic save states on close
  - /Users/Public/Snapshots
- Automatic window resize

### [Video Player](https://videojs.com/)

- [Supported Formats](https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Video_codecs) ([codecbox.js](https://github.com/duanyao/codecbox.js))
- Plays [YouTube](https://github.com/videojs/videojs-youtube) videos/shortcuts
- Keyboard Shortcuts (Volume, Seek, Scale, Fullscreen)

### [Vim](https://github.com/coolwanglu/vim.js)

- Code/text editor
- Supports all file types

### [Webamp](https://webamp.org/) (**_.mp3, .wsz_**)

- Winamp audio player
- [Skin support](https://skins.webamp.org/) (w/random skins via [Winamp Skin Museum](https://skins.webamp.org/))
- Playlist & streaming support
- Visualization support (["Milkdrop"](https://github.com/jberg/butterchurn))

# Games 🎮

### [Chess](https://github.com/jhlywa/chess.js) (**_.pgn_**)

- Play against [stockfish.js](https://github.com/nmrugg/stockfish.js), a friend, or watch CPU vs CPU
- Load PGN games w/move navigation

### [ClassiCube](https://www.classicube.net/)

- Minecraft Classic compatible client

### [DX-Ball](https://habr.com/en/post/147339/)

- Block breaker arcade game like Arkanoid

### [Space Cadet Pinball](https://github.com/alula/SpaceCadetPinball)

- Reverse engineering of 3D Pinball from Windows

### [Quake III Arena](https://github.com/lrusso/Quake3)

- Port of the classic first-person shooter

# Try It 🚀

##### Requirements

- [Node.js](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/en/)

##### Development

```
yarn install
yarn build:prebuild
yarn dev
```

##### Production

```
yarn install
yarn build
yarn serve
```

##### Docker

```
docker build -t daedalos .
docker run -dp 3000:3000 --rm --name daedalos daedalos
```

##### Notes

- If during `yarn install` you receive the error `digital envelope routines::unsupported`, you need to set `NODE_OPTIONS` to `--openssl-legacy-provider` ([1](https://github.com/DustinBrett/daedalOS/blob/main/Dockerfile#L3), [2](https://github.com/DustinBrett/daedalOS/blob/main/.github/workflows/main.yml#L17), [3](https://stackoverflow.com/a/69699772/5895982))
