## 🌌 **daedalOS** 🌌

### _Desktop environment in the browser_

![Stars](https://badgen.net/github/stars/DustinBrett/x)
![License](https://badgen.net/github/license/DustinBrett/x)

# Feature Overview

[![Feature Overview](https://img.youtube.com/vi/geCNiJnw8iE/0.jpg)](http://www.youtube.com/watch?v=geCNiJnw8iE)

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

# Mentions 📰

- https://www.zive.cz/clanky/nadsenec-vytvoril-webovou-verzi-windows-10-funguji-v-nem-doom-i-winamp/sc-3-a-214442/default.aspx ([EN](https://www-zive-cz.translate.goog/clanky/nadsenec-vytvoril-webovou-verzi-windows-10-funguji-v-nem-doom-i-winamp/sc-3-a-214442/default.aspx?_x_tr_sl=cs&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp))
- https://www.justgeek.fr/daedalos-un-environnement-de-bureau-dans-votre-navigateur-web-92246/ ([EN](https://www-justgeek-fr.translate.goog/daedalos-un-environnement-de-bureau-dans-votre-navigateur-web-92246/?_x_tr_sl=fr&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp))
- https://touchit.sk/win-10-na-webe/394071 ([EN](https://touchit-sk.translate.goog/win-10-na-webe/394071?_x_tr_sl=sk&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp))
- https://www.genbeta.com/windows/paso-52-semanas-modificando-su-web-personal-funcionara-como-windows-10-publico-codigo-ahora-trabaja-microsoft ([EN](https://www-genbeta-com.translate.goog/windows/paso-52-semanas-modificando-su-web-personal-funcionara-como-windows-10-publico-codigo-ahora-trabaja-microsoft?_x_tr_sl=es&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=wapp))
- https://terminalroot.com.br/2022/02/conheca-o-daedalos-um-desktop-que-roda-no-navegador.html ([EN](https://terminalroot-com-br.translate.goog/2022/02/conheca-o-daedalos-um-desktop-que-roda-no-navegador.html?_x_tr_sl=es&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp))
- https://www.easy-tutorials.com/daedalos-a-desktop-environment-in-your-web-browser/
- YouTube: [JetBrainsTV](https://youtu.be/LThSVanTfe8), [Brodie Robertson](https://youtu.be/MGrLYzW2ezc), [ELANDRES17](https://youtu.be/JOo2DxLJxj0), [Master Tutos 93](https://youtu.be/GL6VRqRn7gc), [ThatsNotM3](https://youtu.be/XGM_NZCba-Y)
- Reddit: [r/InternetIsBeautiful](https://www.reddit.com/r/InternetIsBeautiful/comments/s466gw/after_1_year_of_hard_work_my_new_ultimate_web/), [r/linux](https://www.reddit.com/r/linux/comments/s03y8e/after_1_year_of_hard_work_my_new_ultimate_web/), [r/selfhosted](https://www.reddit.com/r/selfhosted/comments/rxjfhx/after_1_year_of_hard_work_my_new_ultimate_web/), [r/programming](https://www.reddit.com/r/programming/comments/rvzdqt/after_1_year_of_hard_work_my_new_ultimate_web/), [r/reactjs](https://www.reddit.com/r/reactjs/comments/rugj5a/after_1_year_of_hard_work_my_new_ultimate_web/), [r/Windows10](https://www.reddit.com/r/Windows10/comments/s5yufz/after_1_year_of_hard_work_my_new_ultimate_web/), [r/itrunsdoom](https://www.reddit.com/r/itrunsdoom/comments/rv8l2m/after_1_year_of_hard_work_my_new_ultimate_web/), [r/unixporn](https://www.reddit.com/r/unixporn/comments/selysp/daedalos_ive_turned_my_website_into_a_web_desktop/), [r/web_design](https://www.reddit.com/r/web_design/comments/ryd14x/after_1_year_of_hard_work_my_new_ultimate_web/), [r/webdev](https://www.reddit.com/r/webdev/comments/rz4ypi/after_1_year_of_hard_work_my_new_ultimate_web/), [r/windows](https://www.reddit.com/r/windows/comments/sbt9p2/i_spent_2021_turning_my_personal_website_into_a/), [r/geek](https://www.reddit.com/r/geek/comments/s9som4/i_spent_2021_turning_my_personal_website_into_a/), [r/javascript](https://www.reddit.com/r/javascript/comments/rws27k/after_1_year_of_hard_work_my_new_ultimate_web/), [r/commandline](https://www.reddit.com/r/commandline/comments/s9srtu/i_turned_my_personal_website_into_an_os_with_a/), [r/WebAssembly](https://www.reddit.com/r/WebAssembly/comments/s9st0m/ive_turned_my_personal_website_into_an_os_and/), [r/Design](https://www.reddit.com/r/Design/comments/seltt8/ive_redesigned_my_website_into_an_interactive_web/)

# System 🧠

### [File System](https://github.com/jvilk/BrowserFS)

- File Explorer
  - Back, Forward, Recent locations, Address bar, Search
- [Drag & Drop](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) File Support (internal & external)
  - Loading progress dialog
- ZIP ([write support](https://www.npmjs.com/package/fflate)), [ZIP](https://github.com/jvilk/BrowserFS/blob/master/src/backend/ZipFS.ts)/[ISO](https://github.com/jvilk/BrowserFS/blob/master/src/backend/IsoFS.ts) read support, [RAR extract](https://www.npmjs.com/package/node-unrar-js) support
- Writes to [IndexedDb](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- Group selection/manipulation & drag to sort
- Dynamic and auto cached icons for [music](https://github.com/Borewit/music-metadata-browser), images & video
- Context Menus
  - Cut, Copy, Create shortcut, Delete, Rename
  - [Add file(s)](https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications), [Map directory](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
  - Open with, Open file/folder location, Open in new window
  - Download, Add to archive, Extract here, Set as wallpaper, Convert audio/video/photo
  - Sort by, New Folder, New Text Document
- Keyboard Shortcuts
  - CTRL+C, CTRL+V, CTRL+X, CTRL+A, Delete
  - F2, F5, Backspace, Arrows, Enter
- File information tooltips
- Allow sorting by name, date, type or extension
  - Persists states

### Windows

- [Resizable and Draggable](https://github.com/bokuweb/react-rnd)
- Minimize, Maximize & Close
- Persists size/position/maximized states
- [Animates](https://www.framer.com/motion/) opening and closing

### Start Menu

- Expandable Sidebar
  - Apps list, Documents shortcut, Power (clears session)
- Spotlight visual effect
- Folder support
- Keyboard shortcut opens with **_SHIFT+ESC_**

### Taskbar

- [Peek](https://github.com/bubkoo/html-to-image) hover preview of windows
- Focused window indicator

### Clock

- Runs in a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- Synced to system clock on load
- Date tooltip

### Wallpaper

- [Dynamic animated wallpaper](https://www.vantajs.com/)
  - Uses [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)/[Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- Set via images (Fill, Fit, Stretch, Tile, Center)

### URL

- Query parameter loading
  - Examples:
    - `/?url=/favicon.ico`
    - `/?app=TinyMCE`

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

### [PDF](https://mozilla.github.io/pdf.js/) (**_.pdf_**)

- Renders PDF's
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
  - Examples:
    - `wapm cowsay moo` ([\#](https://wapm.io/package/cowsay))
    - `wax fortune` ([\#](https://wapm.io/package/fortune))
- [Weather information](https://wttr.in/)
- Activate from Start Menu or **_SHIFT+F10_**

### [TinyMCE](https://www.tiny.cloud/tinymce/) (**_.whtml_**)

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

### [Webamp](https://webamp.org/) (**_.mp3, .wsz_**)

- Winamp audio player
- [Skin support](https://skins.webamp.org/)
